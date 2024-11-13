import {
  type RowSelectionState,
  type SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { type APIVariableScopeEnum, type APIVariableTypeEnum, type VariableResponse } from 'qovery-typescript-axios'
import { Fragment, useContext, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { match } from 'ts-pattern'
import { ExternalServiceEnum, IconEnum } from '@qovery/shared/enums'
import { APPLICATION_GENERAL_URL, APPLICATION_URL, DATABASE_GENERAL_URL, DATABASE_URL } from '@qovery/shared/routes'
import {
  Button,
  Checkbox,
  DropdownMenu,
  EmptyState,
  Icon,
  PasswordShowHide,
  TableFilter,
  TableFilterSearch,
  TablePrimitives,
  Tooltip,
  Truncate,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { dateUTCString, timeAgo } from '@qovery/shared/util-dates'
import {
  environmentVariableFile,
  getEnvironmentVariableFileMountPath,
  pluralize,
  twMerge,
  upperCaseFirstLetter,
} from '@qovery/shared/util-js'
import { CreateUpdateVariableModal } from '../create-update-variable-modal/create-update-variable-modal'
import { useDeleteVariable } from '../hooks/use-delete-variable/use-delete-variable'
import { useVariables } from '../hooks/use-variables/use-variables'
import { VariablesContext } from '../variables-context/variables-context'
import { VariableListActionBar } from './variable-list-action-bar'
import { VariableListSkeleton } from './variable-list-skeleton'

const { Table } = TablePrimitives

type Scope = Exclude<keyof typeof APIVariableScopeEnum, 'BUILT_IN'>

export type VariableListProps = {
  className?: string
  onCreateVariable?: (variable: VariableResponse | void) => void
  onEditVariable?: (variable: VariableResponse | void) => void
  onDeleteVariable?: (variable: VariableResponse) => void
} & (
  | {
      scope: Extract<Scope, 'PROJECT'>
      projectId: string
    }
  | {
      scope: Extract<Scope, 'ENVIRONMENT'>
      organizationId: string
      projectId: string
      environmentId: string
    }
  | {
      scope: Exclude<Scope, 'PROJECT' | 'ENVIRONMENT'>
      organizationId: string
      projectId: string
      environmentId: string
      serviceId: string
    }
)

export function VariableList({
  className,
  onCreateVariable,
  onEditVariable,
  onDeleteVariable,
  ...props
}: VariableListProps) {
  const parentId = match(props)
    .with({ scope: 'PROJECT' }, ({ projectId }) => projectId)
    .with({ scope: 'ENVIRONMENT' }, ({ environmentId }) => environmentId)
    .otherwise(({ serviceId }) => serviceId)
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const { data: variables = [], isLoading: isVariablesLoading } = useVariables({
    parentId,
    scope: props.scope,
  })
  const { showAllVariablesValues } = useContext(VariablesContext)
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const { mutateAsync: deleteVariable } = useDeleteVariable()
  const [globalFilter, setGlobalFilter] = useState('')

  const _onCreateVariable: (
    variable: VariableResponse,
    variableType: typeof APIVariableTypeEnum.OVERRIDE | typeof APIVariableTypeEnum.ALIAS
  ) => void = (variable, variableType) => {
    openModal({
      content: (
        <CreateUpdateVariableModal
          closeModal={closeModal}
          variable={variable}
          type={variableType}
          mode="CREATE"
          onSubmit={onCreateVariable}
          {...props}
        />
      ),
    })
  }

  const _onEditVariable: (variable: VariableResponse) => void = (variable) => {
    openModal({
      content: (
        <CreateUpdateVariableModal
          closeModal={closeModal}
          variable={variable}
          mode="UPDATE"
          type={variable.variable_type}
          onSubmit={onEditVariable}
          {...props}
        />
      ),
    })
  }

  const _onDeleteVariable: VariableListProps['onDeleteVariable'] = (variable) => {
    openModalConfirmation({
      title: 'Delete variable',
      name: variable.key,
      isDelete: true,
      action: async () => {
        await deleteVariable({ variableId: variable.id })
        onDeleteVariable?.(variable)
      },
    })
  }
  const showServiceLinkColumn = 'organizationId' in props

  const columnHelper = createColumnHelper<(typeof variables)[number]>()
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        enableColumnFilter: false,
        enableSorting: false,
        header: ({ table }) => (
          <div className="h-5">
            {/** XXX: fix css weird 1px vertical shift when checked/unchecked **/}
            <Checkbox
              checked={
                table.getIsSomeRowsSelected()
                  ? table.getIsAllRowsSelected()
                    ? true
                    : 'indeterminate'
                  : table.getIsAllRowsSelected()
              }
              onCheckedChange={(checked) => {
                if (checked === 'indeterminate') {
                  return
                }
                table.toggleAllRowsSelected(checked)
              }}
            />
          </div>
        ),
        cell: ({ row }) =>
          row.getCanSelect() ? (
            <label className="absolute inset-y-0 left-0 flex items-center p-4" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(checked) => {
                  if (checked === 'indeterminate') {
                    return
                  }
                  row.toggleSelected(checked)
                }}
              />
            </label>
          ) : null,
      }),
      columnHelper.accessor('key', {
        id: 'key',
        header: ({ table }) => {
          const isSearching = table.getRowCount() !== variables.length
          return isSearching
            ? `${table.getRowCount()}/${variables.length} ${pluralize(table.getRowCount(), 'variable')}`
            : `${variables.length} ${pluralize(variables.length, 'variable')}`
        },
        enableColumnFilter: false,
        size: showServiceLinkColumn ? 40 : 45,
        cell: (info) => {
          const variable = info.row.original

          return (
            <div className="flex flex-col justify-center gap-1">
              <div className="flex items-center gap-2">
                <div className="truncate">
                  {variable.owned_by === ExternalServiceEnum.DOPPLER && (
                    <span
                      data-testid="doppler-tag"
                      className="mr-2 inline-flex h-4 items-center rounded-sm bg-[#3391FB] px-1 text-2xs font-bold text-neutral-50"
                    >
                      {variable.owned_by}
                    </span>
                  )}
                  {variable.aliased_variable && (
                    <span className="mr-2 inline-flex h-4 items-center rounded-sm bg-teal-500 px-1 text-2xs font-bold text-neutral-50">
                      ALIAS
                    </span>
                  )}
                  {variable.overridden_variable && (
                    <span className="mr-2 inline-flex h-4 items-center rounded-sm bg-brand-500 px-1 text-2xs font-bold text-neutral-50">
                      OVERRIDE
                    </span>
                  )}
                  {variable.mount_path && (
                    <span className="mr-2 inline-flex h-4 items-center rounded-sm bg-purple-500 px-1 text-2xs font-bold text-neutral-50">
                      FILE
                    </span>
                  )}
                  <Tooltip align="start" content={variable.key || ''}>
                    <span className="truncate text-sm font-medium">{variable.key}</span>
                  </Tooltip>
                  {variable.owned_by === ExternalServiceEnum.DOPPLER && (
                    <Tooltip content="Sync with Doppler">
                      <span className="ml-2">
                        <Icon name={IconEnum.DOPPLER} width="11px" height="11px" />
                      </span>
                    </Tooltip>
                  )}
                </div>
                {variable.description && (
                  <Tooltip content={variable.description}>
                    <span>
                      <Icon iconName="circle-info" iconStyle="regular" className="text-neutral-350" />
                    </span>
                  </Tooltip>
                )}
              </div>
              {(variable.aliased_variable || variable.overridden_variable) && (
                <div className="flex flex-row gap-1 text-2xs text-neutral-350">
                  <Icon iconName="arrow-turn-down-right" iconStyle="regular" className="text-2xs text-neutral-300" />
                  {variable.aliased_variable && <span>{variable.aliased_variable.key}</span>}
                  {variable.overridden_variable && <span>{variable.overridden_variable.key}</span>}
                </div>
              )}
            </div>
          )
        },
      }),
      columnHelper.display({
        id: 'actions',
        cell: (info) => {
          const variable = info.row.original
          const alreadyOverridden = variables.some(({ overridden_variable }) => variable.id === overridden_variable?.id)
          const disableOverride = match(variable.scope)
            .with('APPLICATION', 'CONTAINER', 'JOB', 'HELM', () => true)
            .otherwise(() => alreadyOverridden)

          return (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button variant="outline" size="md" aria-label="actions">
                  <Icon iconName="ellipsis-vertical" iconStyle="regular" className="mx-1" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                {variable.owned_by === ExternalServiceEnum.DOPPLER ? (
                  <DropdownMenu.Item
                    icon={<Icon iconName="arrow-up-right-from-square" />}
                    onSelect={() => window.open('https://dashboard.doppler.com', '_blank')}
                  >
                    Edit in Doppler
                  </DropdownMenu.Item>
                ) : (
                  <>
                    {variable.scope !== 'BUILT_IN' && (
                      <DropdownMenu.Item icon={<Icon iconName="pen" />} onSelect={() => _onEditVariable(variable)}>
                        Edit
                      </DropdownMenu.Item>
                    )}
                    {!variable.overridden_variable && !variable.aliased_variable && (
                      <>
                        <DropdownMenu.Item
                          icon={<Icon iconName="pen-swirl" />}
                          onSelect={() => _onCreateVariable(variable, 'ALIAS')}
                        >
                          Create alias
                        </DropdownMenu.Item>
                        {variable.scope !== 'BUILT_IN' && (
                          <DropdownMenu.Item
                            icon={<Icon iconName="pen-line" />}
                            disabled={disableOverride}
                            onSelect={() => _onCreateVariable(variable, 'OVERRIDE')}
                          >
                            <Tooltip
                              disabled={!disableOverride}
                              content={
                                alreadyOverridden
                                  ? 'Variable already overridden'
                                  : 'You can’t override variables on the application scope'
                              }
                            >
                              <span>Create override</span>
                            </Tooltip>
                          </DropdownMenu.Item>
                        )}
                      </>
                    )}
                    {variable.owned_by === 'QOVERY' && variable.scope !== 'BUILT_IN' && (
                      <>
                        <DropdownMenu.Separator />
                        <DropdownMenu.Item
                          icon={<Icon iconName="trash" />}
                          onSelect={() => _onDeleteVariable(variable)}
                          color="red"
                        >
                          Delete
                        </DropdownMenu.Item>
                      </>
                    )}
                  </>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          )
        },
      }),
      columnHelper.accessor('variable_kind', {
        header: 'Value',
        size: showServiceLinkColumn ? 20 : 25,
        enableColumnFilter: true,
        filterFn: 'arrIncludesSome',
        cell: (info) => {
          const variable = info.row.original
          if (environmentVariableFile(variable)) {
            return (
              <div className="flex items-center gap-3" onClick={() => _onEditVariable(variable)}>
                {variable.value !== null ? (
                  <Icon className="ml-0.5 text-neutral-400" iconName="file-lines" />
                ) : (
                  <Icon className="ml-0.5 text-neutral-400" iconName="file-lock" />
                )}
                <span className="cursor-pointer text-sky-500 hover:underline">
                  {getEnvironmentVariableFileMountPath(variable)}
                </span>
              </div>
            )
          }
          if (variable.variable_type === 'ALIAS') {
            return null
          }
          if (variable.value !== null) {
            return (
              <PasswordShowHide
                value={variable.value}
                isSecret={variable.is_secret}
                defaultVisible={showAllVariablesValues}
              />
            )
          }
          return <PasswordShowHide value="" isSecret={true} defaultVisible={showAllVariablesValues} />
        },
      }),
      ...match(props)
        .with({ scope: 'PROJECT' }, () => [])
        .otherwise(({ organizationId, projectId, environmentId }) => [
          columnHelper.accessor('service_name', {
            header: 'Service link',
            enableColumnFilter: true,
            filterFn: 'arrIncludesSome',
            size: 15,
            meta: {
              customFacetEntry({ value, count }) {
                return (
                  <>
                    <span className="text-sm font-medium">{value ? upperCaseFirstLetter(value) : 'Null'}</span>
                    <span className="text-xs text-neutral-350">{count}</span>
                  </>
                )
              },
            },
            cell: (info) => {
              const variable = info.row.original
              return variable.service_name && variable.service_type && variable.service_id ? (
                <NavLink
                  className="flex items-center gap-2 text-sm font-medium"
                  to={
                    variable.service_type !== 'DATABASE'
                      ? APPLICATION_URL(organizationId, projectId, environmentId, variable.service_id) +
                        APPLICATION_GENERAL_URL
                      : DATABASE_URL(organizationId, projectId, environmentId, variable.service_id) +
                        DATABASE_GENERAL_URL
                  }
                >
                  {variable.service_type !== 'JOB' && (
                    <Icon name={variable.service_type?.toString() || ''} className="w-4" />
                  )}
                  {variable.service_name}
                </NavLink>
              ) : null
            },
          }),
        ]),
      columnHelper.accessor('scope', {
        header: 'Scope',
        enableColumnFilter: true,
        filterFn: 'arrIncludesSome',
        size: showServiceLinkColumn ? 10 : 15,
        meta: {
          customFilterValue({ filterValue }) {
            return <Truncate text={filterValue.map(upperCaseFirstLetter).join(', ')} truncateLimit={18} />
          },
          customFacetEntry({ value, count }) {
            return (
              <>
                <span className="text-sm font-medium">{upperCaseFirstLetter(value)}</span>
                <span className="text-xs text-neutral-350">{count}</span>
              </>
            )
          },
        },
        cell: (info) => {
          return <span className="text-sm font-medium capitalize">{info.getValue().toLowerCase()}</span>
        },
      }),
      columnHelper.accessor('updated_at', {
        header: 'Last update',
        enableColumnFilter: false,
        enableSorting: true,
        size: 12,
        cell: (info) => {
          const variable = info.row.original
          return (
            <Tooltip
              content={variable.updated_at ? dateUTCString(variable.updated_at) : dateUTCString(variable.created_at)}
            >
              <span className="text-xs text-neutral-350">
                {timeAgo(variable.updated_at ? new Date(variable.updated_at) : new Date(variable.created_at))} ago
              </span>
            </Tooltip>
          )
        },
      }),
    ],
    [variables.length, _onCreateVariable, _onEditVariable, props.scope]
  )

  const aliases = useMemo(() => variables.filter((sorted) => sorted.aliased_variable), [variables])

  const table = useReactTable({
    data: variables,
    columns,
    state: {
      sorting,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: (row) => row.original.scope !== 'BUILT_IN',
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _, value) => {
      // Search by variable by key
      // row.original.overridden_variable?.key
      const pattern = value?.toLowerCase?.()

      const aliasedVariable = aliases.find(({ aliased_variable }) => row.original.key === aliased_variable?.key)

      if (aliasedVariable && aliasedVariable.key.toLocaleLowerCase().includes(pattern)) {
        return true
      }

      return row.original.key?.toLowerCase?.().includes?.(pattern)
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    // https://github.com/TanStack/table/discussions/3192#discussioncomment-6458134
    defaultColumn: {
      minSize: 0,
      size: Number.MAX_SAFE_INTEGER,
      maxSize: Number.MAX_SAFE_INTEGER,
    },
  })

  if (variables.length === 0 && isVariablesLoading) {
    return <VariableListSkeleton />
  }

  if (variables.length === 0) {
    return (
      <EmptyState
        title="No variable found"
        description="You can create a variable from the button on the top"
        className="mt-2 rounded-t-sm bg-white pt-10"
      />
    )
  }

  const selectedRows = table.getSelectedRowModel().rows.map(({ original }) => original)

  return (
    <div className="flex grow flex-col justify-between">
      <Table.Root className={twMerge('w-full min-w-[800px] table-fixed text-xs', className)}>
        <Table.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id}>
              {headerGroup.headers.map((header, i) => (
                <Table.ColumnHeaderCell
                  className={`${i === 2 ? 'border-r pl-0' : ''} relative font-medium`}
                  key={header.id}
                  style={{ width: i === 0 ? '20px' : i === 2 ? '50px' : `${header.getSize()}%` }}
                >
                  {header.column.getCanFilter() ? (
                    <TableFilter column={header.column} />
                  ) : header.column.getCanSort() ? (
                    <button
                      type="button"
                      className={twMerge(
                        'flex items-center gap-1',
                        header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {match(header.column.getIsSorted())
                        .with('asc', () => <Icon className="text-xs" iconName="arrow-down" />)
                        .with('desc', () => <Icon className="text-xs" iconName="arrow-up" />)
                        .with(false, () => null)
                        .exhaustive()}
                    </button>
                  ) : (
                    flexRender(header.column.columnDef.header, header.getContext())
                  )}
                  {i === 1 && (
                    <span className="absolute -right-9 top-[7px]">
                      <TableFilterSearch
                        value={globalFilter ?? ''}
                        onChange={(event) => setGlobalFilter(event.target.value)}
                      />
                    </span>
                  )}
                </Table.ColumnHeaderCell>
              ))}
            </Table.Row>
          ))}
        </Table.Header>
        <Table.Body>
          {table.getRowModel().rows.map((row) => (
            <Fragment key={row.id}>
              <Table.Row className="h-16 cursor-pointer hover:bg-neutral-100">
                {row.getVisibleCells().map((cell, i) => (
                  <Table.Cell
                    key={cell.id}
                    className={`${i === 2 ? 'border-r pl-0' : ''} first:relative`}
                    style={{ width: i === 0 ? '20px' : `${cell.column.getSize()}%` }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Cell>
                ))}
              </Table.Row>
            </Fragment>
          ))}
        </Table.Body>
      </Table.Root>
      <VariableListActionBar selectedRows={selectedRows} resetRowSelection={() => table.resetRowSelection()} />
    </div>
  )
}

export default VariableList
