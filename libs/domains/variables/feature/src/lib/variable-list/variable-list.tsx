import {
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
  DropdownMenu,
  EmptyState,
  Icon,
  PasswordShowHide,
  TableFilter,
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
import { VariableListSkeleton } from './variable-list-skeleton'

const { Table } = TablePrimitives

type VariableScope = Exclude<keyof typeof APIVariableScopeEnum, 'BUILT_IN'>

export type VariableListProps = {
  className?: string
  parentId: string
  onCreateVariable?: (variable: VariableResponse | void) => void
  onEditVariable?: (variable: VariableResponse | void) => void
  onDeleteVariable?: (variable: VariableResponse) => void
} & (
  | {
      currentScope: Exclude<VariableScope, 'ENVIRONMENT' | 'PROJECT'>
      organizationId: string
      projectId: string
      environmentId: string
    }
  | {
      currentScope: Extract<VariableScope, 'ENVIRONMENT' | 'PROJECT'>
    }
)

export function VariableList({
  className,
  parentId,
  currentScope,
  onCreateVariable,
  onEditVariable,
  onDeleteVariable,
  ...props
}: VariableListProps) {
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const { data: variables = [], isLoading: isVariablesLoading } = useVariables({
    parentId,
    scope: currentScope,
  })
  const { showAllVariablesValues, setShowAllVariablesValues } = useContext(VariablesContext)
  const [sorting, setSorting] = useState<SortingState>([])

  const { mutateAsync: deleteVariable } = useDeleteVariable()

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
          parentId={parentId}
          scope={currentScope}
          onSubmit={onCreateVariable}
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
          parentId={parentId}
          type={variable.variable_type}
          scope={currentScope}
          onSubmit={onEditVariable}
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

  const isServiceScope = 'organizationId' in props

  const columnHelper = createColumnHelper<(typeof variables)[number]>()
  const columns = useMemo(
    () => [
      columnHelper.accessor('key', {
        id: 'key',
        header: `${variables.length} ${pluralize(variables.length, 'variable')}`,
        enableColumnFilter: false,
        size: isServiceScope ? 40 : 55,
        cell: (info) => {
          const variable = info.row.original
          return (
            <div className="flex items-center">
              {variable.owned_by === ExternalServiceEnum.DOPPLER && (
                <span
                  data-testid="doppler-tag"
                  className="bg-[#3391FB] font-bold rounded-sm text-2xs text-neutral-50 px-1 inline-flex items-center h-4 mr-2"
                >
                  {variable.owned_by}
                </span>
              )}{' '}
              {variable.aliased_variable ? (
                <>
                  <Icon
                    iconName="arrow-turn-down-right"
                    iconStyle="regular"
                    className="mr-2 ml-1 text-2xs text-neutral-300"
                  />
                  <span className="bg-teal-500 font-bold rounded-sm text-2xs text-neutral-50 px-1 inline-flex items-center h-4 mr-2">
                    ALIAS
                  </span>
                </>
              ) : variable.overridden_variable ? (
                <>
                  <Icon
                    iconName="arrow-turn-down-right"
                    iconStyle="regular"
                    className="mr-2 ml-1 text-2xs text-neutral-300"
                  />
                  <span className="bg-brand-500 font-bold rounded-sm text-2xs text-neutral-50 px-1 inline-flex items-center h-4 mr-2">
                    OVERRIDE
                  </span>
                </>
              ) : (
                ''
              )}
              {variable.mount_path ? (
                <span className="bg-purple-500 font-bold rounded-sm text-2xs text-neutral-50 px-1 inline-flex items-center h-4 mr-2">
                  FILE
                </span>
              ) : (
                ''
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
          )
        },
      }),
      columnHelper.display({
        id: 'actions',
        cell: (info) => {
          const variable = info.row.original
          const disableOverride = match(variable.scope)
            .with('APPLICATION', 'CONTAINER', 'JOB', 'HELM', () => true)
            .otherwise(() => false)

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
                              content="You can’t override variables on the application scope"
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
        size: 20,
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
                <span className="text-sky-500 hover:underline cursor-pointer">
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
      ...(isServiceScope
        ? [
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
                const { organizationId, projectId, environmentId } = props
                return variable.service_name && variable.service_type && variable.service_id ? (
                  <NavLink
                    className="flex gap-2 items-center text-sm font-medium"
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
          ]
        : []),
      columnHelper.accessor('scope', {
        header: 'Scope',
        enableColumnFilter: true,
        filterFn: 'arrIncludesSome',
        size: 10,
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
          return <span className="capitalize text-sm font-medium">{info.getValue().toLowerCase()}</span>
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
              <span className="text-xs text-neutral-300">
                {timeAgo(variable.updated_at ? new Date(variable.updated_at) : new Date(variable.created_at))} ago
              </span>
            </Tooltip>
          )
        },
      }),
    ],
    [variables.length, _onCreateVariable, _onEditVariable, isServiceScope]
  )
  const table = useReactTable({
    data: variables,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
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
        className="bg-white rounded-t-sm mt-2 pt-10"
      />
    )
  }

  return (
    <Table.Root className={twMerge('table-fixed w-full text-xs min-w-[800px]', className)}>
      <Table.Header>
        {table.getHeaderGroups().map((headerGroup) => (
          <Table.Row key={headerGroup.id}>
            {headerGroup.headers.map((header, i) => (
              <Table.ColumnHeaderCell
                className={`${i === 1 ? 'border-r pl-0' : ''} font-medium`}
                key={header.id}
                style={{ width: i === 1 ? '50px' : `${header.getSize()}%` }}
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
              </Table.ColumnHeaderCell>
            ))}
          </Table.Row>
        ))}
      </Table.Header>
      <Table.Body>
        {table.getRowModel().rows.map((row) => (
          <Fragment key={row.id}>
            <Table.Row className="hover:bg-neutral-100 h-16 cursor-pointer">
              {row.getVisibleCells().map((cell, i) => (
                <Table.Cell key={cell.id} className={`${i === 1 ? 'border-r pl-0' : ''} first:relative`}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Table.Cell>
              ))}
            </Table.Row>
          </Fragment>
        ))}
      </Table.Body>
    </Table.Root>
  )
}

export default VariableList
