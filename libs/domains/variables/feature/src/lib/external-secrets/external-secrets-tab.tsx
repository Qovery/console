import { Link, useParams } from '@tanstack/react-router'
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
import { useCallback, useEffect, useMemo, useState } from 'react'
import { match } from 'ts-pattern'
import { type VariableScope } from '@qovery/domains/variables/data-access'
import { isExternalSecretVariable } from '@qovery/domains/variables/util'
import {
  Button,
  Checkbox,
  DropdownMenu,
  EmptyState,
  Icon,
  TableFilter,
  TableFilterSearch,
  TablePrimitives,
  Tooltip,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { pluralize, twMerge } from '@qovery/shared/util-js'
import { useCreateVariable } from '../hooks/use-create-variable/use-create-variable'
import { useDeleteVariable } from '../hooks/use-delete-variable/use-delete-variable'
import { useEditVariable } from '../hooks/use-edit-variable/use-edit-variable'
import { useVariables } from '../hooks/use-variables/use-variables'
import {
  AddSecretModal,
  type SecretSourceOption,
  mapSecretManagersToSources,
} from './add-secret-modal/add-secret-modal'
import { type ExternalSecretRow, mapVariableToExternalSecretRow } from './external-secrets-utils'
import { useVariablesSecretManagers } from './use-variables-secret-managers'

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

const gridLayoutClassName = 'grid w-full grid-cols-[32px_minmax(0,1fr)_240px_220px_140px_104px]'

const columnHelper = createColumnHelper<ExternalSecretRow>()

export type ExternalSecretsTabProps = {
  scope: VariableScope
  parentId: string
}

export function ExternalSecretsTab({ scope, parentId }: ExternalSecretsTabProps) {
  const { organizationId = '' } = useParams({ strict: false })
  const { secretManagers, hasClusterSecretManagerConfigured, clusterId } = useVariablesSecretManagers()

  const { data: variables = [] } = useVariables({
    parentId,
    scope,
    suspense: true,
  })

  const secrets = useMemo(
    () =>
      variables
        .filter(isExternalSecretVariable)
        .map((variable) => mapVariableToExternalSecretRow(variable, secretManagers)),
    [secretManagers, variables]
  )
  const [search, setSearch] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const { mutateAsync: createVariable } = useCreateVariable()
  const { mutateAsync: editVariable } = useEditVariable()
  const { mutateAsync: deleteVariable } = useDeleteVariable()

  const secretSources = useMemo(() => mapSecretManagersToSources(secretManagers), [secretManagers])

  const getSourceOption = useCallback(
    (secret?: ExternalSecretRow): SecretSourceOption | undefined => {
      if (!secret?.source) {
        return secretSources[0]
      }
      return secretSources.find((option) => option.tableLabel === secret.source) ?? secretSources[0]
    },
    [secretSources]
  )

  const handleCreateSecret = useCallback(
    async ({
      name,
      description,
      filePath,
      isFile,
      reference,
      secretManagerAccessId,
    }: {
      name: string
      description?: string
      filePath?: string
      isFile: boolean
      reference: string
      secretManagerAccessId: string
    }) => {
      await createVariable({
        variableRequest: {
          key: name,
          value: reference,
          mount_path: isFile ? filePath ?? null : null,
          is_secret: false,
          variable_scope: scope,
          variable_parent_id: parentId,
          description: description ?? null,
          secret_manager_access_id: secretManagerAccessId,
        },
      })
    },
    [createVariable, parentId, scope]
  )

  const handleEditSecret = useCallback(
    async (
      secretId: string,
      {
        name,
        description,
        reference,
        secretManagerAccessId,
      }: {
        name: string
        description?: string
        reference: string
        secretManagerAccessId: string
      }
    ) => {
      await editVariable({
        variableId: secretId,
        variableEditRequest: {
          key: name,
          value: reference,
          description: description ?? null,
          secret_manager_access_id: secretManagerAccessId,
        },
      })
    },
    [editVariable]
  )

  const handleOpenAddSecret = useCallback(
    (isFile: boolean) => {
      openModal({
        content: (
          <AddSecretModal
            secretSources={secretSources}
            defaultSource={secretSources[0]}
            isFile={isFile}
            onClose={closeModal}
            onSubmit={handleCreateSecret}
          />
        ),
        options: {
          width: 520,
          fakeModal: true,
        },
      })
    },
    [closeModal, handleCreateSecret, openModal, secretSources]
  )

  const handleOpenEditSecret = useCallback(
    (secret: ExternalSecretRow) => {
      openModal({
        content: (
          <AddSecretModal
            mode="edit"
            secretSources={secretSources}
            defaultSource={getSourceOption(secret)}
            isFile={secret.isFile ?? false}
            initialSecret={secret}
            onClose={closeModal}
            onSubmit={(updated) =>
              handleEditSecret(secret.id, {
                name: updated.name,
                description: updated.description,
                reference: updated.reference,
                secretManagerAccessId: updated.secretManagerAccessId,
              })
            }
          />
        ),
        options: {
          width: 520,
          fakeModal: true,
        },
      })
    },
    [closeModal, getSourceOption, handleEditSecret, openModal, secretSources]
  )

  useEffect(() => {
    setSearch('')
    setSorting([])
    setColumnFilters([])
    setRowSelection({})
  }, [secrets])

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
          <Link
            to="/organization/$organizationId/cluster/$clusterId/settings/addons"
            params={{ organizationId, clusterId }}
          >
            <Button color="neutral" size="md" variant="solid" type="button">
              Cluster settings
              <Icon iconName="chevron-right" />
            </Button>
          </Link>
        ),
      }
    }

    return {
      title: 'No external secrets yet',
      description: 'Add a secret or connect a secret manager to sync external secrets.',
      icon: 'lock-keyhole' as const,
      actions: (
        <Button
          color="neutral"
          size="md"
          variant="solid"
          type="button"
          disabled={!hasClusterSecretManagerConfigured}
          onClick={() => handleOpenAddSecret(false)}
        >
          <Icon iconName="circle-plus" iconStyle="regular" />
          Add secret
        </Button>
      ),
    }
  }, [clusterId, handleOpenAddSecret, hasClusterSecretManagerConfigured, organizationId, secrets.length])

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
            <span className="flex min-w-0 items-center gap-1.5 text-sm text-neutral">
              {secret.sourceIcon && (
                <Icon
                  name={match(secret.sourceIcon)
                    .with('aws', () => 'AWS' as const)
                    .with('gcp', () => 'GCP' as const)
                    .otherwise(() => 'AWS' as const)}
                  width="16"
                  height="16"
                  className="shrink-0"
                />
              )}
              <Tooltip align="start" content={secret.source}>
                <span className="truncate">{secret.source}</span>
              </Tooltip>
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
          return (
            <div className="flex items-center justify-end gap-2">
              <Button
                aria-label="Edit"
                color="neutral"
                size="sm"
                variant="outline"
                iconOnly
                type="button"
                onClick={() => handleOpenEditSecret(secret)}
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
    [handleConfirmDeleteSecrets, handleOpenEditSecret]
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
    <div className="flex flex-col">
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
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button color="brand" variant="solid" size="md">
                  <Icon iconName="circle-plus" iconStyle="regular" />
                  Add secret
                  <Icon iconName="chevron-down" className="text-[10px]" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content className="w-[240px]">
                {ADD_SECRET_OPTIONS.map((option) => (
                  <DropdownMenu.Item
                    key={option.value}
                    icon={<Icon iconName={option.icon} />}
                    onSelect={() => handleOpenAddSecret(option.value === 'file')}
                  >
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
                    {['source', 'scope'].includes(header.column.id) ? (
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
  )
}
