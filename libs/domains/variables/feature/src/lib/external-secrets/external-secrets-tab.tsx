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
import posthog from 'posthog-js'
import { Fragment, type KeyboardEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { match } from 'ts-pattern'
import { getSecretManagerProvider } from '@qovery/domains/clusters/data-access'
import { type VariableScope } from '@qovery/domains/variables/data-access'
import { isExternalSecretVariable } from '@qovery/domains/variables/util'
import {
  Button,
  Checkbox,
  EmptyState,
  Icon,
  TableFilter,
  TableFilterSearch,
  TablePrimitives,
  Tooltip,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { generateScopeLabel, pluralize, twMerge } from '@qovery/shared/util-js'
import { useCreateVariable } from '../hooks/use-create-variable/use-create-variable'
import { useDeleteVariable } from '../hooks/use-delete-variable/use-delete-variable'
import { useEditVariable } from '../hooks/use-edit-variable/use-edit-variable'
import { useVariablesSecretManagers } from '../hooks/use-variables-secret-managers/use-variables-secret-managers'
import { useVariables } from '../hooks/use-variables/use-variables'
import { AddSecretDropdown, type SecretFormat } from './add-secret-dropdown'
import {
  AddSecretModal,
  type AddSecretModalSubmitData,
  type SecretSourceOption,
  mapSecretManagersToSources,
} from './add-secret-modal/add-secret-modal'
import { type ExternalSecretJSON, createJsonSecretPreview } from './external-secret-json-preview'
import { JsonSecretKeys } from './json-secret-keys'

const { Table } = TablePrimitives

const gridLayoutClassName = 'grid w-full grid-cols-[32px_minmax(0,1fr)_240px_220px_140px_104px]'

type ExternalSecretRow = {
  id: string
  name: string
  description?: string
  filePath?: string
  isFile?: boolean
  isJson?: boolean
  keys?: string[]
  previewParentId?: string
  secretManagerAccessId?: string
  reference: string
  source: string | null
  sourceIcon?: 'AWS' | 'GCP'
  scope: string
}

const columnHelper = createColumnHelper<ExternalSecretRow>()

export type ExternalSecretsTabProps = {
  scope: VariableScope
  parentId: string
  onCreateSecret?: () => void
  onEditSecret?: () => void
  onDeleteSecret?: () => void
}

export function ExternalSecretsTab({
  scope,
  parentId,
  onCreateSecret,
  onEditSecret,
  onDeleteSecret,
}: ExternalSecretsTabProps) {
  const { organizationId = '' } = useParams({ strict: false })
  const { secretManagers, hasClusterSecretManagerConfigured, clusterId } = useVariablesSecretManagers()

  const { data: variables = [] } = useVariables({
    parentId,
    scope,
    suspense: true,
  })

  // TODO(secret-manager-json): Replace local create/edit/delete state with the API when its contract is available.
  // The seeded example and all JSON changes currently reset when this component remounts.
  const [jsonSecrets, setJsonSecrets] = useState<ExternalSecretJSON[]>(() =>
    createJsonSecretPreview(parentId, scope, secretManagers[0])
  )
  const [collapsedJsonSecrets, setCollapsedJsonSecrets] = useState<Record<string, boolean>>({})

  const secrets = useMemo<ExternalSecretRow[]>(
    () => [
      ...variables.filter(isExternalSecretVariable).map((variable) => {
        const secretManager = secretManagers.find((manager) => manager.id === variable.secret_manager_access_id)

        return {
          id: variable.id,
          name: variable.key,
          description: variable.description,
          filePath: variable.mount_path ?? undefined,
          isFile: Boolean(variable.mount_path),
          reference: variable.value ?? '',
          source: secretManager?.name ?? null,
          sourceIcon: getSecretManagerProvider(secretManager),
          scope: generateScopeLabel(variable.scope),
        }
      }),
      ...jsonSecrets.filter((secret) => secret.previewParentId === parentId),
    ],
    [secretManagers, variables, jsonSecrets, parentId]
  )
  const [search, setSearch] = useState('')
  const searchQuery = search.trim().toLowerCase()
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
      return (
        secretSources.find(
          (option) => option.value === secret.secretManagerAccessId || option.tableLabel === secret.source
        ) ?? secretSources[0]
      )
    },
    [secretSources]
  )

  const handleCreateSecret = useCallback(
    async ({
      name,
      description,
      filePath,
      isFile,
      isJson,
      keys,
      reference,
      secretManagerAccessId,
    }: AddSecretModalSubmitData) => {
      if (isJson) {
        const manager = secretManagers.find((item) => item.id === secretManagerAccessId)
        setJsonSecrets((current) => [
          ...current,
          {
            id: `local-json-${crypto.randomUUID()}`,
            name,
            reference,
            description,
            isJson: true,
            keys,
            source: manager?.name ?? null,
            sourceIcon: getSecretManagerProvider(manager),
            secretManagerAccessId,
            scope: generateScopeLabel(scope),
            previewParentId: parentId,
          },
        ])
        return
      }
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
      onCreateSecret?.()
    },
    [createVariable, onCreateSecret, parentId, scope, secretManagers]
  )

  const handleEditSecret = useCallback(
    async (
      secretId: string,
      { name, description, filePath, isFile, isJson, keys, reference, secretManagerAccessId }: AddSecretModalSubmitData
    ) => {
      if (isJson) {
        const manager = secretManagers.find((item) => item.id === secretManagerAccessId)
        setJsonSecrets((current) =>
          current.map((secret) =>
            secret.id === secretId
              ? {
                  ...secret,
                  name,
                  reference,
                  description,
                  secretManagerAccessId,
                  source: manager?.name ?? null,
                  sourceIcon: getSecretManagerProvider(manager),
                  keys,
                }
              : secret
          )
        )
        return
      }
      const variableEditRequest = {
        key: name,
        value: reference,
        mount_path: isFile ? filePath ?? null : null,
        description: description ?? null,
        secret_manager_access_id: secretManagerAccessId,
      }

      await editVariable({
        variableId: secretId,
        variableEditRequest,
      })
      onEditSecret?.()
    },
    [editVariable, onEditSecret, secretManagers]
  )

  const handleOpenAddSecret = useCallback(
    (format: SecretFormat) => {
      const isFile = format === 'file'
      posthog.capture('external-secret-add-clicked', {
        scope,
        is_file: isFile,
      })
      openModal({
        content: (
          <AddSecretModal
            secretSources={secretSources}
            jsonSecrets={jsonSecrets}
            defaultSource={secretSources[0]}
            isFile={isFile}
            isJson={format === 'json'}
            scope={scope}
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
    [closeModal, handleCreateSecret, openModal, scope, secretSources, jsonSecrets]
  )

  const handleOpenEditSecret = useCallback(
    (secret: ExternalSecretRow) => {
      openModal({
        content: (
          <AddSecretModal
            mode="edit"
            secretSources={secretSources}
            jsonSecrets={jsonSecrets}
            defaultSource={getSourceOption(secret)}
            isFile={secret.isFile ?? false}
            isJson={secret.isJson}
            initialSecret={secret}
            onClose={closeModal}
            onSubmit={(updated) => handleEditSecret(secret.id, updated)}
          />
        ),
        options: {
          width: 520,
          fakeModal: true,
        },
      })
    },
    [closeModal, getSourceOption, handleEditSecret, openModal, secretSources, jsonSecrets]
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
      const localIds = new Set(jsonSecrets.map((secret) => secret.id))
      const remoteIds = [...idsToDelete].filter((id) => !localIds.has(id))
      await Promise.all(remoteIds.map((variableId) => deleteVariable({ variableId })))
      setJsonSecrets((current) => current.filter((secret) => !idsToDelete.has(secret.id)))
      if (remoteIds.length > 0) onDeleteSecret?.()
      setRowSelection((prev) => {
        const next = { ...prev }
        for (const secretId of secretIds) {
          delete next[secretId]
        }
        return next
      })
    },
    [deleteVariable, onDeleteSecret, jsonSecrets]
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
      actions: <AddSecretDropdown color="neutral" onSelect={handleOpenAddSecret} />,
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
          if (secret.isJson) {
            const expanded = !collapsedJsonSecrets[secret.id]
            return (
              <div className="flex w-full items-center justify-between gap-2">
                <span className="flex min-w-0 flex-col justify-center gap-1">
                  <Tooltip align="start" content={secret.name}>
                    <span className="truncate text-sm font-medium">{secret.name}</span>
                  </Tooltip>
                  <span className="flex items-center gap-1 text-ssm text-neutral-subtle">
                    <Icon iconName="brackets-curly" />
                    {secret.keys
                      ? `${secret.keys.length} ${pluralize(secret.keys.length, 'secret')} imported`
                      : 'Keys unavailable'}
                  </span>
                </span>
                <span className="flex w-6 shrink-0 justify-center">
                  <Icon iconName={expanded ? 'chevron-up' : 'chevron-down'} className="text-neutral-subtle" />
                </span>
              </div>
            )
          }
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
              {secret.sourceIcon && <Icon name={secret.sourceIcon} width="16" height="16" className="shrink-0" />}
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
    [handleConfirmDeleteSecrets, handleOpenEditSecret, collapsedJsonSecrets]
  )

  const table = useReactTable({
    data: secrets,
    columns,
    state: { sorting, rowSelection, globalFilter: search, columnFilters },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setSearch,
    onColumnFiltersChange: setColumnFilters,
    globalFilterFn: (row, columnId, value: string) => {
      const query = value.trim().toLowerCase()
      return (
        String(row.getValue(columnId) ?? '')
          .toLowerCase()
          .includes(query) || Boolean(row.original.keys?.some((key) => key.toLowerCase().includes(query)))
      )
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getRowId: (row) => row.id,
  })

  const shouldShowEmptyState = secrets.length === 0 && Boolean(emptyStateConfig)
  const countSecrets = (rows: ExternalSecretRow[], query = '') =>
    rows.reduce(
      (count, secret) =>
        count + (secret.isJson ? secret.keys?.filter((key) => key.toLowerCase().includes(query)).length ?? 0 : 1),
      0
    )
  const totalSecrets = countSecrets(secrets)
  const visibleSecrets = table.getRowModel().rows.map(({ original }) => original)
  const visibleCount = countSecrets(visibleSecrets, searchQuery)
  const unknownCount = visibleSecrets.filter((secret) => secret.isJson && !secret.keys).length
  const isSearching = visibleCount !== totalSecrets || table.getRowCount() !== secrets.length
  const countText =
    (isSearching
      ? `${visibleCount}/${totalSecrets} external ${totalSecrets === 1 ? 'secret' : 'secrets'}`
      : `${totalSecrets} external ${totalSecrets === 1 ? 'secret' : 'secrets'}`) +
    (unknownCount > 0 ? ` · ${unknownCount} JSON ${pluralize(unknownCount, 'count')} unavailable` : '')
  const selectedRows = table.getSelectedRowModel().rows.map(({ original }) => original)
  const selectedIds = selectedRows.map((secret) => secret.id)
  const hasSelection = selectedIds.length > 0

  return (
    <div className="flex flex-col">
      {!shouldShowEmptyState && (
        <div className="flex items-center justify-between border-b border-neutral bg-surface-neutral px-4 py-2">
          <div className="flex items-center gap-1.5 text-sm font-medium text-neutral">
            <span>{countText}</span>
            <Tooltip content="Each imported JSON key counts as one external secret. JSON secrets with unavailable keys are excluded.">
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
              onChange={(e) => {
                const value = e.target.value
                setSearch(value)
                const query = value.trim().toLowerCase()
                if (query) {
                  setCollapsedJsonSecrets((current) => {
                    const next = { ...current }
                    for (const secret of secrets) {
                      if (secret.keys?.some((key) => key.toLowerCase().includes(query))) {
                        delete next[secret.id]
                      }
                    }
                    return next
                  })
                }
              }}
            />
            <AddSecretDropdown onSelect={handleOpenAddSecret} />
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
            {table.getRowModel().rows.length === 0 && (
              <Table.Row>
                <Table.Cell colSpan={6} className="text-center text-sm text-neutral-subtle">
                  No secrets match your search or filters.
                </Table.Cell>
              </Table.Row>
            )}
            {table.getRowModel().rows.map((row) => {
              const matchingKeys = row.original.keys?.filter((key) => key.toLowerCase().includes(searchQuery))
              return (
                <Fragment key={row.id}>
                  <Table.Row
                    className={twMerge('h-16 items-center hover:bg-surface-neutral-subtle', gridLayoutClassName)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <Table.Cell
                        key={cell.id}
                        {...(cell.column.id === 'name' && row.original.isJson
                          ? {
                              tabIndex: 0,
                              'aria-label': `${collapsedJsonSecrets[row.id] ? 'Expand' : 'Collapse'} keys for ${row.original.reference}`,
                              'aria-expanded': !collapsedJsonSecrets[row.id],
                              'aria-controls': `json-keys-${row.id}`,
                              onClick: () =>
                                setCollapsedJsonSecrets((current) => ({ ...current, [row.id]: !current[row.id] })),
                              onKeyDown: (event: KeyboardEvent<HTMLTableCellElement>) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault()
                                  setCollapsedJsonSecrets((current) => ({ ...current, [row.id]: !current[row.id] }))
                                }
                              },
                            }
                          : {})}
                        className={twMerge(
                          'flex h-full items-center first:relative',
                          cell.column.id === 'actions' && 'justify-end',
                          cell.column.id === 'name' && 'border-r border-neutral',
                          cell.column.id === 'name' &&
                            row.original.isJson &&
                            'cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-strong'
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </Table.Cell>
                    ))}
                  </Table.Row>
                  {row.original.isJson && !collapsedJsonSecrets[row.id] && (
                    <Table.Row id={`json-keys-${row.id}`}>
                      <Table.Cell colSpan={6} className="h-auto bg-surface-neutral-subtle py-3">
                        {matchingKeys ? (
                          matchingKeys.length > 0 ? (
                            <JsonSecretKeys keys={matchingKeys} label={`JSON keys for ${row.original.reference}`} />
                          ) : (
                            <p className="text-sm text-neutral-subtle">No keys match your search.</p>
                          )
                        ) : (
                          <p className="text-sm text-neutral-subtle">Keys are not available yet.</p>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Fragment>
              )
            })}
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
