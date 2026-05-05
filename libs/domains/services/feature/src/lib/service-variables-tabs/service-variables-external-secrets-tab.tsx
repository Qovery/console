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
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import {
  Button,
  Callout,
  Checkbox,
  DropdownMenu,
  EmptyState,
  Icon,
  InputSelect,
  ModalCrud,
  type SyncStatus,
  TableFilter,
  TableFilterSearch,
  TablePrimitives,
  Tooltip,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { pluralize, twMerge } from '@qovery/shared/util-js'
import {
  AddSecretModal,
  type ExternalSecret,
  SECRET_SOURCES,
  type SecretSourceOption,
} from './add-secret-modal/add-secret-modal'

const { Table } = TablePrimitives

export type ExternalSecretsUseCaseId =
  | 'filled'
  | 'secret-manager-addon-not-detected'
  | 'secret-manager-addon-no-manager'
  | 'secret-manager-addon-not-redeployed'
  | 'empty'

interface ExternalSecretRow extends ExternalSecret {
  status: SyncStatus
}

const FAKE_SECRETS: ExternalSecretRow[] = [
  {
    id: '1',
    name: 'DB_PASSWORD',
    reference: 'my-app/prod/db-password',
    status: 'synced',
    source: 'Prod secret manager',
    sourceIcon: 'aws',
    scope: 'Environment',
  },
  {
    id: '2',
    name: 'API_KEY',
    filePath: '/vault/secrets/api-key',
    isFile: true,
    reference: 'my-app/prod/api-key',
    status: 'synced',
    source: 'Prod secret manager',
    sourceIcon: 'aws',
    scope: 'Application',
  },
  {
    id: '3',
    name: 'API_SECRET_KEY',
    reference: 'my-app/prod/api-keys',
    status: 'synced',
    source: 'Prod secret manager',
    sourceIcon: 'aws',
    scope: 'Application',
  },
  {
    id: '4',
    name: 'APP_SECRET_KEY',
    reference: 'prod/app/backend/payment/datab...',
    status: 'broken',
    source: 'GCP secret manager',
    sourceIcon: 'gcp',
    scope: 'Application',
  },
  {
    id: '5',
    name: 'SMTP_PASSWORD',
    reference: 'my-app/prod/smtp-credentials',
    status: 'broken',
    source: 'Prod secret manager',
    sourceIcon: 'aws',
    scope: 'Application',
  },
  {
    id: '6',
    name: 'REDIS_PASSWORD',
    reference: 'my-app/prod/redis-auth',
    status: 'detached',
    source: null,
    scope: 'Application',
  },
  {
    id: '7',
    name: 'AWS_SECRET_KEY',
    reference: 'my-app/prod/oauth-secrets',
    status: 'detached',
    source: null,
    scope: 'Application',
  },
]

const EMPTY_SECRETS: ExternalSecretRow[] = []

export const EXTERNAL_SECRETS_USE_CASES: { id: ExternalSecretsUseCaseId; label: string }[] = [
  { id: 'filled', label: 'Filled' },
  { id: 'secret-manager-addon-not-detected', label: 'Secret manager add-on not detected' },
  { id: 'secret-manager-addon-no-manager', label: 'Secret manager add-on with no manager' },
  { id: 'secret-manager-addon-not-redeployed', label: 'Secret manager add-on not redeployed' },
  { id: 'empty', label: 'No secrets yet' },
]

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

interface AttachSecretsModalProps {
  selectedCount: number
  onClose: () => void
  onAttach: (source: SecretSourceOption) => void
}

type AttachSecretsFormValues = {
  source: SecretSourceOption['value'] | ''
}

function AttachSecretsModal({ selectedCount, onClose, onAttach }: AttachSecretsModalProps) {
  const methods = useForm<AttachSecretsFormValues>({
    defaultValues: {
      source: '',
    },
    mode: 'onChange',
  })
  const { enableAlertClickOutside } = useModal()
  const selectedSource = methods.watch('source')

  useEffect(() => {
    enableAlertClickOutside(methods.formState.isDirty)
  }, [enableAlertClickOutside, methods.formState.isDirty])

  const handleSubmit = methods.handleSubmit((data) => {
    const option = SECRET_SOURCES.find((source) => source.value === data.source)
    if (!option) return
    onAttach(option)
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title="Attach secrets to secret manager"
        description="Add an external secret file to use on this service. Qovery will resolve its value at deployment and mount it inside your container."
        onSubmit={handleSubmit}
        onClose={onClose}
        submitLabel={`Attach ${selectedCount} ${pluralize(selectedCount, 'secret')}`}
      >
        <>
          <Controller
            name="source"
            control={methods.control}
            rules={{ required: 'Please select a source.' }}
            render={({ field }) => (
              <InputSelect
                className="mb-3 w-full"
                label="Source"
                portal
                options={SECRET_SOURCES.map((option) => ({
                  label: option.label,
                  value: option.value,
                  icon: (
                    <Icon
                      name={match(option.icon)
                        .with('aws', () => 'AWS' as const)
                        .with('gcp', () => 'GCP' as const)
                        .exhaustive()}
                      width="16"
                      height="16"
                    />
                  ),
                }))}
                value={field.value}
                onChange={(value) => field.onChange(value as SecretSourceOption['value'])}
                placeholder="Select a source"
              />
            )}
          />
          {selectedSource && (
            <Callout.Root color="yellow" className="mb-6">
              <Callout.Icon>
                <Icon iconName="triangle-exclamation" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text>
                <Callout.TextHeading>Warning</Callout.TextHeading>
                <Callout.TextDescription>
                  Please ensure matching secrets exist in the target secret manager, or some variables may appear as
                  broken.
                </Callout.TextDescription>
              </Callout.Text>
            </Callout.Root>
          )}
        </>
      </ModalCrud>
    </FormProvider>
  )
}

interface ExternalSecretsTabProps {
  selectedCaseId?: ExternalSecretsUseCaseId
}

export function ExternalSecretsTab({ selectedCaseId = 'filled' }: ExternalSecretsTabProps) {
  const baseSecrets = useMemo(
    () =>
      match(selectedCaseId)
        .with('secret-manager-addon-not-detected', () => EMPTY_SECRETS)
        .with('secret-manager-addon-no-manager', () => EMPTY_SECRETS)
        .with('secret-manager-addon-not-redeployed', () => EMPTY_SECRETS)
        .with('empty', () => EMPTY_SECRETS)
        .otherwise(() => FAKE_SECRETS),
    [selectedCaseId]
  )

  const [search, setSearch] = useState('')
  const [secrets, setSecrets] = useState(baseSecrets)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  useEffect(() => {
    setSecrets(baseSecrets)
    setSearch('')
    setSorting([])
    setColumnFilters([])
    setRowSelection({})
  }, [baseSecrets])

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

  const getSourceOption = useCallback((secret?: ExternalSecretRow) => {
    if (!secret?.source) {
      return SECRET_SOURCES[0]
    }
    return SECRET_SOURCES.find((option) => option.tableLabel === secret.source) ?? SECRET_SOURCES[0]
  }, [])

  const handleOpenAddSecret = useCallback(
    (isFile: boolean) => {
      openModal({
        content: (
          <AddSecretModal
            defaultSource={SECRET_SOURCES[0]}
            isFile={isFile}
            onClose={closeModal}
            onSubmit={(secret) => {
              setSecrets((prev) => [
                {
                  ...secret,
                  id: `secret-${Date.now()}`,
                  status: 'synced',
                },
                ...prev,
              ])
            }}
          />
        ),
        options: {
          width: 520,
          fakeModal: true,
        },
      })
    },
    [closeModal, openModal]
  )

  const handleOpenEditSecret = useCallback(
    (secret: ExternalSecretRow) => {
      openModal({
        content: (
          <AddSecretModal
            mode="edit"
            defaultSource={getSourceOption(secret)}
            isFile={secret.isFile ?? false}
            initialSecret={secret}
            onClose={closeModal}
            onSubmit={(updated) => {
              setSecrets((prev) =>
                prev.map((item) =>
                  item.id === secret.id
                    ? {
                        ...item,
                        ...updated,
                      }
                    : item
                )
              )
            }}
          />
        ),
        options: {
          width: 520,
          fakeModal: true,
        },
      })
    },
    [closeModal, getSourceOption, openModal]
  )

  const handleOpenAttach = useCallback(
    (selectedIds: string[]) => {
      openModal({
        content: (
          <AttachSecretsModal
            selectedCount={selectedIds.length}
            onClose={closeModal}
            onAttach={(source) => {
              setSecrets((prev) =>
                prev.map((secret) =>
                  selectedIds.includes(secret.id)
                    ? {
                        ...secret,
                        source: source.tableLabel,
                        sourceIcon: source.icon,
                      }
                    : secret
                )
              )
              setRowSelection({})
              closeModal()
            }}
          />
        ),
        options: {
          width: 520,
          fakeModal: true,
        },
      })
    },
    [closeModal, openModal]
  )

  const handleDeleteSecrets = useCallback((secretIds: string[]) => {
    const idsToDelete = new Set(secretIds)
    setSecrets((prev) => prev.filter((secret) => !idsToDelete.has(secret.id)))
    setRowSelection((prev) => {
      const next = { ...prev }
      for (const secretId of secretIds) {
        delete next[secretId]
      }
      return next
    })
  }, [])

  const handleConfirmDeleteSecrets = useCallback(
    (secretIds: string[]) => {
      if (secretIds.length === 0) return

      const deletionTargetLabel =
        secretIds.length === 1
          ? secrets.find((secret) => secret.id === secretIds[0])?.name ?? 'this variable'
          : 'these variables'

      openModalConfirmation({
        title: `Delete ${secretIds.length} ${pluralize(secretIds.length, 'variable')}`,
        name: deletionTargetLabel,
        confirmationMethod: 'action',
        action: () => handleDeleteSecrets(secretIds),
      })
    },
    [handleDeleteSecrets, openModalConfirmation, secrets]
  )

  const emptyStateConfig = useMemo(
    () =>
      match(selectedCaseId)
        .with('secret-manager-addon-not-detected', () => ({
          title: 'Secret manager add-on not installed on your cluster',
          description: 'Install it and start linking external secrets to your service',
          icon: 'puzzle-piece' as const,
          actions: (
            <Button color="neutral" size="md" variant="solid" className="gap-2" type="button">
              Install add-on
              <Icon iconName="chevron-right" />
            </Button>
          ),
        }))
        .with('secret-manager-addon-no-manager', () => ({
          title: 'No secret manager linked on your cluster',
          description: 'Secret add-on has been activated on your cluster but no secret manager are linked to it.',
          icon: 'lock-keyhole' as const,
          actions: (
            <div className="flex items-center justify-center">
              <Button color="neutral" size="md" variant="solid" type="button">
                Cluster settings
                <Icon iconName="chevron-right" />
              </Button>
            </div>
          ),
        }))
        .with('secret-manager-addon-not-redeployed', () => ({
          title: 'Secret manager not deployed',
          description:
            'We have detected linked secret manager on your cluster, but they have not been deployed yet. Secrets will be available as soon as their secret manager is deployed.',
          icon: 'lock-keyhole' as const,
          actions: (
            <Button color="neutral" size="md" variant="solid" className="gap-2" type="button">
              <Icon iconName="rocket" iconStyle="regular" />
              Redeploy cluster
            </Button>
          ),
        }))
        .with('empty', () => ({
          title: 'No external secrets yet',
          description: 'Add a secret or connect a secret manager to sync external secrets.',
          icon: 'lock-keyhole' as const,
          actions: (
            <Button
              color="neutral"
              size="md"
              variant="solid"
              className="gap-2"
              type="button"
              onClick={() => handleOpenAddSecret(false)}
            >
              <Icon iconName="circle-plus" iconStyle="regular" />
              Add secret
            </Button>
          ),
        }))
        .otherwise(() => null),
    [handleOpenAddSecret, selectedCaseId]
  )

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
    <div className="flex grow flex-col">
      {/* Header bar */}
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

      {/* Table */}
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
              <Button
                color="neutralInverted"
                variant="outline"
                size="md"
                className="gap-2"
                onClick={() => handleOpenAttach(selectedIds)}
              >
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
