import {
  type ColumnFiltersState,
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
import { type SecretManagerAccess } from 'qovery-typescript-axios'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { match } from 'ts-pattern'
import { useDeleteVariable, useVariables } from '@qovery/domains/variables/feature'
import {
  Button,
  Checkbox,
  DropdownMenu,
  EmptyState,
  Icon,
  LoaderSpinner,
  type SyncStatus,
  TableFilter,
  TableFilterSearch,
  TablePrimitives,
  Tooltip,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { pluralize, twMerge } from '@qovery/shared/util-js'
import {
  type ExternalSecretRow,
  isExternalSecretVariable,
  mapVariableToExternalSecretRow,
} from './service-variables-external-secrets-utils'

const { Table } = TablePrimitives

const ADD_SECRET_OPTIONS = [
  {
    value: 'variable',
    label: 'Add secret as variable',
    icon: 'key' as const,
  },
  {
    value: 'file',
    label: 'Add secret as file',
    icon: 'file-lines' as const,
  },
]

const gridLayoutClassName = 'grid w-full grid-cols-[32px_minmax(0,1fr)_240px_124px_220px_140px_104px]'

const STATUS_LABELS: Record<SyncStatus, string> = {
  synced: 'Valid',
  broken: 'Invalid',
  syncing: 'Checking...',
  detached: 'Detached',
}

function ExternalSecretStatusBadge({ status }: { status: SyncStatus }) {
  return match(status)
    .with('synced', () => (
      <span className="inline-flex h-6 items-center gap-1 rounded-[6px] border border-positive-subtle bg-surface-positive-subtle px-1.5 text-[12px] font-medium text-positive">
        <Icon iconName="circle-check" iconStyle="regular" className="text-[12px]" />
        <span>Valid</span>
      </span>
    ))
    .with('broken', () => (
      <span className="inline-flex h-6 items-center gap-1 rounded-[6px] border border-negative-subtle bg-surface-negative-subtle px-1.5 text-[12px] font-medium text-negative">
        <Icon iconName="circle-exclamation" className="text-[12px]" />
        <span>Invalid</span>
      </span>
    ))
    .with('syncing', () => (
      <span className="inline-flex h-6 items-center gap-1 rounded-[6px] border border-info-subtle bg-surface-info-subtle px-1.5 text-[12px] font-medium text-info">
        <Icon iconName="spinner-third" iconStyle="regular" className="animate-spin text-[12px]" />
        <span>Checking...</span>
      </span>
    ))
    .otherwise(() => (
      <span className="inline-flex h-6 items-center gap-1 rounded-[6px] border border-neutral-component bg-surface-neutral-component px-1.5 text-[12px] font-medium text-neutral-subtle">
        <Icon iconName="link-broken" className="text-[12px]" />
        <span>Detached</span>
      </span>
    ))
}

const columnHelper = createColumnHelper<ExternalSecretRow>()

interface ExternalSecretsTabProps {
  scope: 'APPLICATION' | 'CONTAINER' | 'JOB' | 'HELM' | 'TERRAFORM'
  serviceId: string
  secretManagers?: SecretManagerAccess[]
  hasClusterSecretManagerConfigured?: boolean
}

export function ExternalSecretsTab({
  scope,
  serviceId,
  secretManagers = [],
  hasClusterSecretManagerConfigured = false,
}: ExternalSecretsTabProps) {
  const { data: variables = [], isLoading } = useVariables({
    parentId: serviceId,
    scope,
  })

  const fetchedSecrets = useMemo(
    () =>
      variables
        .filter(isExternalSecretVariable)
        .map((variable) => mapVariableToExternalSecretRow(variable, secretManagers)),
    [secretManagers, variables]
  )

  const [search, setSearch] = useState('')
  const [secrets, setSecrets] = useState(fetchedSecrets)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const { openModalConfirmation } = useModalConfirmation()
  const { mutateAsync: deleteVariable } = useDeleteVariable()

  useEffect(() => {
    setSecrets(fetchedSecrets)
    setSearch('')
    setSorting([])
    setColumnFilters([])
    setRowSelection({})
  }, [fetchedSecrets])

  const handleCheckReferences = useCallback(
    (secretIds?: string[]) => {
      const targetIds = secretIds ? new Set(secretIds) : null
      const previousStatuses = new Map(secrets.map((secret) => [secret.id, secret.status]))
      const shouldCheck = (secret: ExternalSecretRow) => !targetIds || targetIds.has(secret.id)

      setSecrets((prev) =>
        prev.map((secret) =>
          shouldCheck(secret) && secret.status !== 'syncing' ? { ...secret, status: 'syncing' as const } : secret
        )
      )

      setTimeout(() => {
        setSecrets((prev) =>
          prev.map((secret) =>
            shouldCheck(secret) && secret.status === 'syncing'
              ? { ...secret, status: previousStatuses.get(secret.id) ?? secret.status }
              : secret
          )
        )
      }, 3000)
    },
    [secrets]
  )

  const handleDeleteSecrets = useCallback(
    async (secretIds: string[]) => {
      const idsToDelete = new Set(secretIds)
      await Promise.all([...idsToDelete].map((variableId) => deleteVariable({ variableId })))
      setRowSelection((prev) => {
        const next = { ...prev }
        for (const secretId of secretIds) {
          delete next[secretId]
        }
        return next
      })
    },
    [deleteVariable]
  )

  const handleConfirmDeleteSecrets = useCallback(
    (secretIds: string[]) => {
      if (secretIds.length === 0) return

      const deletionTargetLabel =
        secretIds.length === 1
          ? secrets.find((secret) => secret.id === secretIds[0])?.name ?? 'this secret'
          : 'these secrets'

      openModalConfirmation({
        title: `Delete ${secretIds.length} ${pluralize(secretIds.length, 'secret')}`,
        name: deletionTargetLabel,
        confirmationMethod: 'action',
        action: () => handleDeleteSecrets(secretIds),
      })
    },
    [handleDeleteSecrets, openModalConfirmation, secrets]
  )

  const emptyStateConfig = useMemo(() => {
    if (secrets.length > 0) {
      return null
    }

    if (!hasClusterSecretManagerConfigured) {
      return {
        title: 'No secret manager linked on your cluster',
        description: 'Secret add-on has been activated on your cluster but no secret manager are linked to it.',
        icon: 'lock-keyhole' as const,
        actions: (
          <Button color="neutral" size="md" variant="solid" type="button" disabled>
            Cluster settings
            <Icon iconName="chevron-right" />
          </Button>
        ),
      }
    }

    return {
      title: 'No external secrets yet',
      description: 'Add a secret or connect a secret manager to sync external secrets.',
      icon: 'lock-keyhole' as const,
      actions: (
        <Button color="neutral" size="md" variant="solid" className="gap-2" type="button" disabled>
          <Icon iconName="circle-plus" iconStyle="regular" />
          Add secret
        </Button>
      ),
    }
  }, [hasClusterSecretManagerConfigured, secrets.length])

  const columns = useMemo(
    () => [
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
                if (checked === 'indeterminate') return
                table.toggleAllRowsSelected(checked)
              }}
            />
          </div>
        ),
        cell: ({ row }) => (
          <label className="absolute inset-y-0 left-0 flex items-center p-4" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(checked) => {
                if (checked === 'indeterminate') return
                row.toggleSelected(checked)
              }}
            />
          </label>
        ),
      }),
      columnHelper.accessor('name', {
        header: 'Name',
        enableSorting: true,
        cell: (info) => {
          const secret = info.row.original
          const showFilePath = secret.isFile && secret.filePath
          return (
            <div className="flex flex-col justify-center gap-1">
              <div className="flex items-center gap-2">
                <Tooltip align="start" content={secret.name}>
                  <span className="truncate text-sm font-medium">{secret.name}</span>
                </Tooltip>
                {secret.description && (
                  <Tooltip content={secret.description}>
                    <span>
                      <Icon iconName="circle-info" iconStyle="regular" className="text-neutral-subtle" />
                    </span>
                  </Tooltip>
                )}
              </div>
              {showFilePath && (
                <div className="flex flex-row gap-1 text-xs text-neutral-subtle">
                  <Icon iconName="file" iconStyle="regular" className="text-xs text-neutral-subtle" />
                  <span>{secret.filePath}</span>
                </div>
              )}
            </div>
          )
        },
      }),
      columnHelper.accessor('reference', {
        header: 'Reference',
        enableSorting: true,
        cell: (info) => <span className="truncate text-sm text-neutral">{info.getValue()}</span>,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        enableSorting: false,
        enableColumnFilter: true,
        meta: {
          customFacetEntry: ({ value, count }) => {
            const status = value as SyncStatus
            return (
              <>
                <span className="text-sm font-medium">{STATUS_LABELS[status] ?? value}</span>
                <span className="text-xs text-neutral-subtle">{count}</span>
              </>
            )
          },
          customFilterValue: ({ filterValue }) => (
            <span className="flex items-center gap-1">
              {filterValue.map((value) => STATUS_LABELS[value as SyncStatus] ?? value).join(', ')}
            </span>
          ),
        },
        filterFn: (row, columnId, filterValue) => {
          if (!Array.isArray(filterValue) || filterValue.length === 0) return true
          return filterValue.includes(row.getValue(columnId))
        },
        cell: (info) => <ExternalSecretStatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor((row) => row.source ?? 'No sources detected', {
        id: 'source',
        header: 'Source',
        enableSorting: false,
        enableColumnFilter: true,
        filterFn: (row, columnId, filterValue) => {
          if (!Array.isArray(filterValue) || filterValue.length === 0) return true
          return filterValue.includes(row.getValue(columnId))
        },
        cell: (info) => {
          const secret = info.row.original
          if (!secret.source) {
            return <span className="text-sm text-neutral-subtle">No sources detected</span>
          }
          return (
            <span className="flex items-center gap-1.5 text-sm text-neutral">
              {secret.sourceIcon && (
                <Icon
                  name={match(secret.sourceIcon)
                    .with('aws', () => 'AWS' as const)
                    .with('gcp', () => 'GCP' as const)
                    .otherwise(() => 'AWS' as const)}
                  width="16"
                  height="16"
                />
              )}
              {secret.source}
            </span>
          )
        },
      }),
      columnHelper.accessor('scope', {
        header: 'Scope',
        enableSorting: false,
        enableColumnFilter: true,
        filterFn: (row, columnId, filterValue) => {
          if (!Array.isArray(filterValue) || filterValue.length === 0) return true
          return filterValue.includes(row.getValue(columnId))
        },
        cell: (info) => <span className="text-sm capitalize text-neutral">{info.getValue()}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
          const secret = info.row.original
          const isSyncing = secret.status === 'syncing'
          return (
            <div className="flex items-center justify-end gap-2">
              <Button
                aria-label="Edit"
                color="neutral"
                size="sm"
                variant="outline"
                iconOnly
                type="button"
                disabled={isSyncing}
              >
                <Tooltip content="Edit">
                  <div className="flex h-full w-full items-center justify-center">
                    <Icon iconName="pen" />
                  </div>
                </Tooltip>
              </Button>
              <Button
                aria-label="Delete"
                color="neutral"
                size="sm"
                variant="outline"
                iconOnly
                type="button"
                disabled={isSyncing}
                onClick={() => handleConfirmDeleteSecrets([secret.id])}
              >
                <Tooltip content="Delete">
                  <div className="flex h-full w-full items-center justify-center">
                    <Icon iconName="trash" />
                  </div>
                </Tooltip>
              </Button>
            </div>
          )
        },
      }),
    ],
    [handleConfirmDeleteSecrets]
  )

  const table = useReactTable({
    data: secrets,
    columns,
    state: { sorting, rowSelection, globalFilter: search, columnFilters },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setSearch,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getRowId: (row) => row.id,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoaderSpinner className="w-6" />
      </div>
    )
  }

  const shouldShowEmptyState = secrets.length === 0 && Boolean(emptyStateConfig)
  const totalRows = table.getPreFilteredRowModel().rows.length
  const isSearching = table.getRowCount() !== totalRows
  const countText = isSearching
    ? `${table.getRowCount()}/${totalRows} external ${pluralize(table.getRowCount(), 'secret')}`
    : `${totalRows} external ${pluralize(totalRows, 'secret')}`
  const selectedRows = table.getSelectedRowModel().rows.map(({ original }) => original)
  const selectedIds = selectedRows.map((secret) => secret.id)
  const hasSelection = selectedIds.length > 0

  return (
    <div className="flex grow flex-col">
      {!shouldShowEmptyState && (
        <div className="flex items-center justify-between border-b border-neutral bg-surface-neutral px-4 py-2">
          <div className="flex items-center gap-1.5 text-sm font-medium text-neutral">
            <span>{countText}</span>
            <Tooltip content="Number of external secrets linked to this service">
              <span>
                <Icon iconName="circle-info" iconStyle="regular" className="text-neutral-subtle" />
              </span>
            </Tooltip>
          </div>
          <div className="flex items-center gap-2">
            <TableFilterSearch
              className="h-8 w-[180px]"
              placeholder="Search secrets"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              color="neutral"
              variant="outline"
              size="md"
              className="gap-2"
              onClick={() => handleCheckReferences()}
            >
              <Icon iconName="rotate" iconStyle="regular" />
              Check references
            </Button>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button color="brand" variant="solid" size="md" className="gap-2">
                  <Icon iconName="circle-plus" iconStyle="regular" />
                  Add secret
                  <Icon iconName="chevron-down" className="text-[10px]" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content className="w-[240px]">
                {ADD_SECRET_OPTIONS.map((option) => (
                  <DropdownMenu.Item key={option.value} icon={<Icon iconName={option.icon} />}>
                    {option.label}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        </div>
      )}

      {shouldShowEmptyState && emptyStateConfig ? (
        <div className="bg-background">
          <EmptyState
            title={emptyStateConfig.title}
            description={emptyStateConfig.description}
            icon={emptyStateConfig.icon}
            className="rounded-none border-0 bg-transparent py-12"
          >
            {emptyStateConfig.actions}
          </EmptyState>
        </div>
      ) : (
        <Table.Root className="w-full min-w-[1240px] text-xs" containerClassName="border-0 rounded-none">
          <Table.Header>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id} className={twMerge('w-full items-center text-xs', gridLayoutClassName)}>
                {headerGroup.headers.map((header) => (
                  <Table.ColumnHeaderCell
                    key={header.id}
                    className={twMerge(
                      'group relative flex items-center font-medium',
                      header.column.id === 'actions' && 'justify-end',
                      header.column.id === 'name' && 'border-r border-neutral'
                    )}
                  >
                    {['status', 'source', 'scope'].includes(header.column.id) ? (
                      <TableFilter column={header.column} />
                    ) : header.column.getCanSort() ? (
                      <button
                        type="button"
                        className="flex cursor-pointer select-none items-center gap-1"
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
                  </Table.ColumnHeaderCell>
                ))}
              </Table.Row>
            ))}
          </Table.Header>
          <Table.Body>
            {table.getRowModel().rows.map((row) => (
              <Table.Row
                key={row.id}
                className={twMerge('h-16 items-center hover:bg-surface-neutral-subtle', gridLayoutClassName)}
              >
                {row.getVisibleCells().map((cell) => (
                  <Table.Cell
                    key={cell.id}
                    className={twMerge(
                      'flex h-full items-center first:relative',
                      cell.column.id === 'actions' && 'justify-end',
                      cell.column.id === 'name' && 'border-r border-neutral'
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}

      <div className={`fixed inset-x-0 bottom-14 z-30 flex justify-center ${hasSelection ? '' : 'hidden'}`}>
        <div className="inline-flex h-14 items-center rounded-md border border-neutral bg-[var(--background-invert-1)] px-4 text-neutralInvert shadow-xl">
          <span className="text-sm font-medium text-neutralInvert">
            {selectedIds.length} selected {pluralize(selectedIds.length, 'secret')}
          </span>
          <div className="ml-8 flex items-center gap-4">
            <button type="button" className="text-ssm font-medium underline" onClick={() => setRowSelection({})}>
              Unselect
            </button>
            <div className="flex items-center gap-1.5">
              <Button
                color="neutralInverted"
                variant="outline"
                size="md"
                className="gap-2"
                onClick={() => handleCheckReferences(selectedIds)}
              >
                <Icon iconName="rotate" iconStyle="regular" />
                Check references
              </Button>
              <Button color="neutralInverted" variant="outline" size="md" className="gap-2" disabled>
                <Icon iconName="link" iconStyle="regular" />
                Attach
              </Button>
              <Button
                aria-label="Delete selected"
                color="redInverted"
                variant="outline"
                size="md"
                iconOnly
                onClick={() => handleConfirmDeleteSecrets(selectedIds)}
              >
                <Icon iconName="trash" iconStyle="regular" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
