import { Link } from '@tanstack/react-router'
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
import { Fragment, type ReactNode, useMemo, useState } from 'react'
import { match } from 'ts-pattern'
import { ExternalServiceEnum, IconEnum, ServiceTypeEnum } from '@qovery/shared/enums'
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
  generateScopeLabel,
  getEnvironmentVariableFileMountPath,
  pluralize,
  twMerge,
  upperCaseFirstLetter,
} from '@qovery/shared/util-js'
import { CreateUpdateVariableModal } from '../create-update-variable-modal/create-update-variable-modal'
import { useDeleteVariable } from '../hooks/use-delete-variable/use-delete-variable'
import { useVariables } from '../hooks/use-variables/use-variables'
import { VariableListActionBar } from './variable-list-action-bar'
import { VariableListSkeleton } from './variable-list-skeleton'

const { Table } = TablePrimitives

type Scope = Exclude<keyof typeof APIVariableScopeEnum, 'BUILT_IN'>

function isServiceScopeServiceType(serviceType: VariableResponse['service_type']): boolean {
  return match(serviceType)
    .with(
      ServiceTypeEnum.APPLICATION,
      ServiceTypeEnum.CONTAINER,
      ServiceTypeEnum.DATABASE,
      ServiceTypeEnum.HELM,
      ServiceTypeEnum.JOB,
      ServiceTypeEnum.TERRAFORM,
      () => true
    )
    .otherwise(() => false)
}

function getVariableScopeLabel(variable: VariableResponse): string {
  if (isServiceScopeServiceType(variable.service_type)) {
    return 'Service'
  }

  return generateScopeLabel(variable.scope)
}

export type VariableListProps = {
  className?: string
  hideSectionLabel?: boolean
  showOnly?: 'custom' | 'built-in'
  headerActions?: ReactNode
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
  hideSectionLabel = false,
  showOnly,
  headerActions,
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
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [builtInSorting, setBuiltInSorting] = useState<SortingState>([])

  const { mutateAsync: deleteVariable } = useDeleteVariable()
  const [globalFilter, setGlobalFilter] = useState('')
  const [builtInGlobalFilter, setBuiltInGlobalFilter] = useState('')
  const nonBuiltInVariables = useMemo(() => variables.filter((variable) => variable.scope !== 'BUILT_IN'), [variables])
  const builtInVariables = useMemo(() => variables.filter((variable) => variable.scope === 'BUILT_IN'), [variables])

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
      options: {
        fakeModal: true,
      },
    })
  }

  const _onCreateStandaloneVariable = (isFile = false) =>
    openModal({
      content: (
        <CreateUpdateVariableModal
          closeModal={closeModal}
          type="VALUE"
          mode="CREATE"
          onSubmit={onCreateVariable}
          isFile={isFile}
          {...props}
        />
      ),
      options: {
        fakeModal: true,
      },
    })

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
      options: {
        fakeModal: true,
      },
    })
  }

  const _onDeleteVariable: VariableListProps['onDeleteVariable'] = (variable) => {
    openModalConfirmation({
      title: 'Delete variable',
      name: variable.key,
      confirmationMethod: 'action',
      action: async () => {
        await deleteVariable({ variableId: variable.id })
        onDeleteVariable?.(variable)
      },
    })
  }
  const isServiceScope = match(props)
    .with(
      { scope: 'APPLICATION' },
      { scope: 'CONTAINER' },
      { scope: 'JOB' },
      { scope: 'HELM' },
      { scope: 'TERRAFORM' },
      () => true
    )
    .otherwise(() => false)
  const isEnvironmentScope = props.scope === 'ENVIRONMENT'
  const showServiceLinkColumn = props.scope !== 'PROJECT'
  const gridLayoutClassName =
    props.scope === 'PROJECT'
      ? 'grid w-full grid-cols-[32px_minmax(0,40%)_50px_minmax(0%,40%)_minmax(0,12%)]'
      : isEnvironmentScope
        ? 'grid w-full grid-cols-[32px_minmax(0,40%)_50px_minmax(0,30%)_minmax(0,15%)_minmax(0,12%)]'
        : 'grid w-full grid-cols-[32px_minmax(0,40%)_minmax(0,1fr)_minmax(0,15%)_minmax(0,12%)_88px]'
  const builtInGridLayoutClassName =
    props.scope === 'PROJECT'
      ? 'grid w-full grid-cols-[minmax(0,calc(40%_+_32px))_50px_minmax(0,40%)_minmax(0,12%)]'
      : isEnvironmentScope
        ? 'grid w-full grid-cols-[minmax(0,calc(40%_+_32px))_50px_minmax(0,30%)_minmax(0,15%)_minmax(0,12%)]'
        : 'grid w-full grid-cols-[minmax(0,calc(40%_+_32px))_minmax(0,1fr)_minmax(0,15%)_minmax(0,12%)_88px]'

  const columnHelper = createColumnHelper<(typeof variables)[number]>()
  const columns = useMemo(() => {
    const baseColumns = [
      columnHelper.display({
        id: 'select',
        enableColumnFilter: false,
        enableSorting: false,
        header: ({ table }) => (
          <div className="flex h-5 items-center">
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
          if (headerActions) return 'Name'
          const totalRows = table.getPreFilteredRowModel().rows.length
          const isSearching = table.getRowCount() !== totalRows
          return isSearching
            ? `${table.getRowCount()}/${totalRows} ${pluralize(table.getRowCount(), 'variable')}`
            : `${totalRows} ${pluralize(totalRows, 'variable')}`
        },
        enableColumnFilter: false,
        size: showServiceLinkColumn ? 40 : 45,
        cell: (info) => {
          const variable = info.row.original
          const isFileVariable = environmentVariableFile(variable)
          const showFilePathUnderName = isServiceScope && showOnly === 'custom' && isFileVariable

          return (
            <div className="flex flex-col justify-center gap-1">
              <div className="flex items-center gap-2">
                <div className="flex items-center truncate">
                  {variable.owned_by === ExternalServiceEnum.DOPPLER && (
                    <span
                      data-testid="doppler-tag"
                      className="mr-2 inline-flex h-4 items-center rounded-sm bg-[#3391FB] px-1 text-2xs font-bold text-neutral"
                    >
                      {variable.owned_by}
                    </span>
                  )}
                  {variable.aliased_variable && (
                    <span className="mr-2 inline-flex h-4 items-center rounded bg-surface-info-component px-1 text-2xs font-bold text-info">
                      ALIAS
                    </span>
                  )}
                  {variable.overridden_variable && (
                    <span className="mr-2 inline-flex h-4 items-center rounded bg-surface-brand-component px-1 text-2xs font-bold text-brand">
                      OVERRIDE
                    </span>
                  )}
                  {variable.mount_path && !showFilePathUnderName && (
                    <span className="mr-2 inline-flex h-4 items-center rounded bg-surface-accent1-component px-1 text-2xs font-bold text-accent1">
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
                      <Icon iconName="circle-info" iconStyle="regular" className="text-neutral-subtle" />
                    </span>
                  </Tooltip>
                )}
              </div>
              {showFilePathUnderName && (
                <div className="flex flex-row items-center gap-1 text-xs text-neutral-subtle">
                  <Icon iconName="file" iconStyle="regular" className="text-xs text-neutral-subtle" />
                  <span>{getEnvironmentVariableFileMountPath(variable)}</span>
                </div>
              )}
              {(variable.aliased_variable || variable.overridden_variable) && (
                <div className="flex flex-row gap-1 text-2xs text-neutral-subtle">
                  <Icon iconName="arrow-turn-down-right" iconStyle="regular" className="text-2xs text-neutral-subtle" />
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
        header: 'Actions',
        cell: (info) => {
          const variable = info.row.original
          const alreadyOverridden = variables.some(({ overridden_variable }) => variable.id === overridden_variable?.id)
          const disableOverride = match(variable.scope)
            .with('APPLICATION', 'CONTAINER', 'JOB', 'HELM', () => true)
            .otherwise(() => alreadyOverridden)
          const isDoppler = variable.owned_by === ExternalServiceEnum.DOPPLER
          const canEdit = isDoppler || variable.scope !== 'BUILT_IN'
          const isBuiltIn = variable.scope === 'BUILT_IN'
          const showAliasOnly = isServiceScope && showOnly === 'built-in' && isBuiltIn

          if (!isServiceScope) {
            return (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <Button variant="outline" size="sm" aria-label="actions" className="justify-center">
                    <Icon iconName="ellipsis-vertical" iconStyle="regular" />
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end">
                  {isDoppler ? (
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
                          {variable.scope !== 'BUILT_IN' && variable.scope !== props.scope && (
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
          }

          if (showAliasOnly) {
            if (variable.overridden_variable || variable.aliased_variable) {
              return <div className="flex items-center justify-end" />
            }

            return (
              <Button
                aria-label="Create alias"
                color="neutral"
                size="sm"
                variant="outline"
                iconOnly
                type="button"
                onClick={() => _onCreateVariable(variable, 'ALIAS')}
              >
                <Tooltip content="Create alias">
                  <div className="flex h-full w-full items-center justify-center">
                    <Icon iconName="pen-swirl" />
                  </div>
                </Tooltip>
              </Button>
            )
          }

          return (
            <div className="flex items-center justify-end gap-2">
              <Button
                aria-label={isDoppler ? 'Edit in Doppler' : 'Edit'}
                color="neutral"
                size="sm"
                variant="outline"
                iconOnly
                type="button"
                disabled={!canEdit}
                onClick={() => {
                  if (!canEdit) return
                  if (isDoppler) {
                    window.open('https://dashboard.doppler.com', '_blank')
                    return
                  }
                  _onEditVariable(variable)
                }}
              >
                <Tooltip content={isDoppler ? 'Edit in Doppler' : 'Edit'}>
                  <div className="flex h-full w-full items-center justify-center">
                    <Icon iconName={isDoppler ? 'arrow-up-right-from-square' : 'pen'} />
                  </div>
                </Tooltip>
              </Button>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <Button aria-label="Other actions" color="neutral" size="sm" variant="outline" iconOnly>
                    <Tooltip content="Other actions">
                      <div className="flex h-full w-full items-center justify-center">
                        <Icon iconName="ellipsis-vertical" iconStyle="regular" />
                      </div>
                    </Tooltip>
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end">
                  {isDoppler ? (
                    <DropdownMenu.Item
                      icon={<Icon iconName="arrow-up-right-from-square" />}
                      onSelect={() => window.open('https://dashboard.doppler.com', '_blank')}
                    >
                      Edit in Doppler
                    </DropdownMenu.Item>
                  ) : (
                    <>
                      {!variable.overridden_variable && !variable.aliased_variable && (
                        <>
                          <DropdownMenu.Item
                            icon={<Icon iconName="pen-swirl" />}
                            onSelect={() => _onCreateVariable(variable, 'ALIAS')}
                          >
                            Create alias
                          </DropdownMenu.Item>
                          {variable.scope !== 'BUILT_IN' && variable.scope !== props.scope && (
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
            </div>
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
          const shouldRenderFilePathInName = isServiceScope && showOnly === 'custom'

          if (environmentVariableFile(variable) && !shouldRenderFilePathInName) {
            return (
              <div className="flex w-full items-center gap-2 text-sm" onClick={() => _onEditVariable(variable)}>
                {variable.value !== null ? (
                  <Icon className="ml-0.5 text-neutral-subtle" iconName="file-lines" />
                ) : (
                  <Icon className="ml-0.5 text-neutral-subtle" iconName="file-lock" />
                )}
                <span className="cursor-pointer truncate hover:underline">
                  {getEnvironmentVariableFileMountPath(variable)}
                </span>
              </div>
            )
          }
          if (variable.variable_type === 'ALIAS') {
            return null
          }
          if (variable.value !== null) {
            return <PasswordShowHide value={variable.value} isSecret={variable.is_secret} />
          }
          return <PasswordShowHide value="" isSecret={true} />
        },
      }),
      ...match(props)
        .with({ scope: 'PROJECT' }, () => [])
        .otherwise(({ organizationId, projectId, environmentId }) => [
          columnHelper.accessor('service_name', {
            header: 'Service link',
            enableColumnFilter: !isServiceScope,
            filterFn: 'arrIncludesSome',
            size: 15,
            meta: {
              customFacetEntry({ value, count }) {
                return (
                  <>
                    <span className="text-sm font-medium">{value ? upperCaseFirstLetter(value) : 'Null'}</span>
                    <span className="text-xs text-neutral-subtle">{count}</span>
                  </>
                )
              },
            },
            cell: (info) => {
              const variable = info.row.original
              return variable.service_name && variable.service_type && variable.service_id ? (
                <Link
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
                </Link>
              ) : (
                <span className="text-sm text-neutral-subtle">-</span>
              )
            },
          }),
        ]),
      columnHelper.accessor(getVariableScopeLabel, {
        id: 'scope',
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
                <span className="text-xs text-neutral-subtle">{count}</span>
              </>
            )
          },
        },
        cell: (info) => {
          const scopeLabel = info.getValue()
          return (
            <span className="text-sm font-medium capitalize">
              {scopeLabel === 'Service' ? scopeLabel : scopeLabel.toLowerCase()}
            </span>
          )
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
              <span className="text-sm text-neutral-subtle">
                {timeAgo(variable.updated_at ? new Date(variable.updated_at) : new Date(variable.created_at))} ago
              </span>
            </Tooltip>
          )
        },
      }),
    ]

    if (!isServiceScope) {
      return baseColumns
    }

    const actionsColumn = baseColumns.find((column) => (column as { id?: string }).id === 'actions')
    const orderedColumns = baseColumns.filter((column) => (column as { id?: string }).id !== 'actions')

    if (actionsColumn) {
      orderedColumns.push(actionsColumn)
    }

    return orderedColumns
  }, [variables.length, _onCreateVariable, _onEditVariable, props.scope, showOnly, !!headerActions, isServiceScope])
  const nonBuiltInColumns = useMemo(() => {
    if (!isEnvironmentScope && props.scope !== 'PROJECT') {
      return columns.filter((column) => {
        const id = (column as { id?: string }).id
        const accessorKey = (column as { accessorKey?: string }).accessorKey
        return id !== 'service_name' && accessorKey !== 'service_name'
      })
    }
    return columns.filter((column) => {
      const id = (column as { id?: string }).id
      const accessorKey = (column as { accessorKey?: string }).accessorKey
      if (props.scope === 'PROJECT') {
        return id !== 'scope' && accessorKey !== 'scope'
      }
      return id !== 'service_name' && accessorKey !== 'service_name'
    })
  }, [columns, isEnvironmentScope, props.scope])

  const scopeSize = showServiceLinkColumn ? 10 : 15
  const builtInColumns = useMemo(
    () =>
      columns
        .filter((column) => {
          const id = (column as { id?: string }).id
          const accessorKey = (column as { accessorKey?: string }).accessorKey
          if (id === 'select') return false
          if (id === 'scope' || accessorKey === 'scope') return false
          return true
        })
        .map((column) => {
          const accessorKey = (column as { accessorKey?: string }).accessorKey
          if (accessorKey === 'variable_kind') {
            const size = (column as { size?: number }).size
            if (typeof size === 'number') {
              return { ...column, size: size + scopeSize }
            }
          }
          return column
        }),
    [columns, scopeSize]
  )

  const aliases = useMemo(() => variables.filter((sorted) => sorted.aliased_variable), [variables])

  const table = useReactTable({
    data: nonBuiltInVariables,
    columns: nonBuiltInColumns,
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

  const builtInTable = useReactTable({
    data: builtInVariables,
    columns: builtInColumns,
    state: {
      sorting: builtInSorting,
      globalFilter: builtInGlobalFilter,
    },
    onSortingChange: setBuiltInSorting,
    onGlobalFilterChange: setBuiltInGlobalFilter,
    enableRowSelection: (row) => row.original.scope !== 'BUILT_IN',
    globalFilterFn: (row, _, value) => {
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
    defaultColumn: {
      minSize: 0,
      size: Number.MAX_SAFE_INTEGER,
      maxSize: Number.MAX_SAFE_INTEGER,
    },
  })

  if (variables.length === 0 && isVariablesLoading) {
    return <VariableListSkeleton />
  }

  if (showOnly === 'custom' && nonBuiltInVariables.length === 0) {
    return (
      <div className="bg-background">
        <EmptyState
          title="No custom variables added yet"
          description="Add environment variables to configure your service at build or runtime."
          icon="wave-pulse"
          className="rounded-none border-0 bg-transparent py-12"
        >
          <div className="flex items-center gap-2">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button color="neutral" variant="solid" size="md" className="gap-1.5">
                  <Icon iconName="circle-plus" iconStyle="regular" />
                  Add variable
                  <Icon iconName="angle-down" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item onSelect={() => _onCreateStandaloneVariable()} icon={<Icon iconName="key" />}>
                  Variable
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={() => _onCreateStandaloneVariable(true)}
                  icon={<Icon iconName="file-lines" iconStyle="regular" />}
                >
                  Variable as file
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>

            <Button
              color="neutral"
              variant="outline"
              size="md"
              className="gap-1.5"
              onClick={() => window.open('https://dashboard.doppler.com', '_blank')}
            >
              <Icon iconName="arrow-up-right-from-square" iconStyle="regular" />
              Import from Doppler
            </Button>
          </div>
        </EmptyState>
      </div>
    )
  }

  if (variables.length === 0) {
    return (
      <EmptyState
        title="No variable found"
        description="You can create a variable from the button on the top"
        className="mt-2 rounded-t-sm bg-surface-neutral pt-10"
      />
    )
  }

  const renderTable = (
    tableInstance: typeof table,
    filterValue: string,
    setFilterValue: (value: string) => void,
    rowGridClassName: string,
    isBuiltInTable: boolean
  ) => {
    const totalRows = tableInstance.getPreFilteredRowModel().rows.length
    const isSearching = tableInstance.getRowCount() !== totalRows
    const countText = isSearching
      ? `${tableInstance.getRowCount()}/${totalRows} ${pluralize(tableInstance.getRowCount(), 'variable')}`
      : `${totalRows} ${pluralize(totalRows, 'variable')}`
    const countTooltipContent = isBuiltInTable
      ? 'Qovery automatically injects built-in variables for service interconnection and system information.'
      : 'Custom variables are values you define to configure your service behavior at build and runtime.'

    return (
      <div className="flex grow flex-col justify-between">
        {headerActions && (
          <div className="flex items-center justify-between border-b border-neutral bg-surface-neutral px-4 py-2">
            <div className="flex items-center gap-1.5 text-sm font-medium text-neutral">
              <span>{countText}</span>
              <Tooltip content={countTooltipContent}>
                <span>
                  <Icon iconName="circle-info" iconStyle="regular" className="text-neutral-subtle" />
                </span>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2">
              <TableFilterSearch
                className="h-8 w-[200px]"
                value={filterValue ?? ''}
                onChange={(event) => setFilterValue(event.target.value)}
              />
              {headerActions}
            </div>
          </div>
        )}
        <Table.Root
          className={twMerge('w-full min-w-[800px] text-xs', className)}
          containerClassName={headerActions ? 'border-0 rounded-none' : undefined}
        >
          <Table.Header>
            {tableInstance.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id} className={twMerge('w-full items-center text-xs', rowGridClassName)}>
                {headerGroup.headers.map((header) => (
                  <Table.ColumnHeaderCell
                    className={twMerge(
                      'group relative flex items-center font-medium',
                      header.column.id === 'actions' && 'justify-end',
                      !isServiceScope && header.column.id === 'actions' && 'border-r border-neutral pl-0',
                      isServiceScope && header.column.id === 'key' && 'border-r border-neutral'
                    )}
                    key={header.id}
                  >
                    {header.column.getCanFilter() ? (
                      <TableFilter column={header.column} />
                    ) : header.column.getCanSort() ? (
                      <button
                        type="button"
                        className={twMerge(
                          'flex items-center gap-1',
                          header.column.getCanSort() ? 'cursor-pointer select-none truncate' : ''
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {match(header.column.getIsSorted())
                          .with('asc', () => <Icon className="text-xs" iconName="arrow-down" />)
                          .with('desc', () => <Icon className="text-xs" iconName="arrow-up" />)
                          .with(false, () => (
                            <Icon
                              className="text-xs opacity-0 transition-opacity group-hover:opacity-100"
                              iconName="arrow-down-arrow-up"
                            />
                          ))
                          .exhaustive()}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                    {header.column.id === 'key' && !headerActions && (
                      <span className="absolute -right-9 top-[7px]">
                        <TableFilterSearch
                          className="h-8 w-[200px]"
                          value={filterValue ?? ''}
                          onChange={(event) => setFilterValue(event.target.value)}
                        />
                      </span>
                    )}
                  </Table.ColumnHeaderCell>
                ))}
              </Table.Row>
            ))}
          </Table.Header>
          <Table.Body>
            {tableInstance.getRowModel().rows.map((row) => (
              <Fragment key={row.id}>
                <Table.Row className={twMerge('h-16 items-center hover:bg-surface-neutral-subtle', rowGridClassName)}>
                  {row.getVisibleCells().map((cell) => (
                    <Table.Cell
                      key={cell.id}
                      className={twMerge(
                        'flex h-full items-center first:relative',
                        cell.column.id === 'actions' && 'justify-end',
                        !isServiceScope && cell.column.id === 'actions' && 'border-r border-neutral pl-0',
                        isServiceScope && cell.column.id === 'key' && 'border-r border-neutral'
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Table.Cell>
                  ))}
                </Table.Row>
              </Fragment>
            ))}
          </Table.Body>
        </Table.Root>
      </div>
    )
  }

  const selectedRows = table.getSelectedRowModel().rows.map(({ original }) => original)

  return (
    <div className="flex min-h-0 flex-col gap-8">
      {showOnly !== 'built-in' && nonBuiltInVariables.length > 0 && (
        <section className="flex min-h-0 flex-col gap-4">
          {!hideSectionLabel && <h3 className="text-base font-medium text-neutral">Custom variables</h3>}
          {renderTable(table, globalFilter, setGlobalFilter, gridLayoutClassName, false)}
        </section>
      )}
      {showOnly !== 'custom' && builtInVariables.length > 0 && (
        <section className="flex min-h-0 flex-col gap-4">
          {!hideSectionLabel && <h3 className="text-base font-medium text-neutral">Built-in variables</h3>}
          {renderTable(builtInTable, builtInGlobalFilter, setBuiltInGlobalFilter, builtInGridLayoutClassName, true)}
        </section>
      )}
      <VariableListActionBar selectedRows={selectedRows} resetRowSelection={() => table.resetRowSelection()} />
    </div>
  )
}

export default VariableList
