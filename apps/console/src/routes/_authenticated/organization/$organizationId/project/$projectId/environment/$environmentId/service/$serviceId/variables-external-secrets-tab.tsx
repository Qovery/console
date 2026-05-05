import {
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
  createColumnHelper,
  flexRender,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getCoreRowModel,
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
  InputText,
  InputTextArea,
  ModalCrud,
  type SyncStatus,
  SyncStatusBadge,
  TableFilterSearch,
  TablePrimitives,
  TableFilter,
  Tooltip,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { pluralize, twMerge } from '@qovery/shared/util-js'

const { Table } = TablePrimitives

export type ExternalSecretsUseCaseId =
  | 'filled'
  | 'secret-manager-addon-not-detected'
  | 'secret-manager-addon-no-manager'
  | 'secret-manager-addon-not-redeployed'
  | 'empty'

interface ExternalSecret {
  id: string
  name: string
  description?: string
  filePath?: string
  isFile?: boolean
  reference: string
  status: SyncStatus
  source: string | null
  sourceIcon?: string
  lastSync: string
}

const FAKE_SECRETS: ExternalSecret[] = [
  {
    id: '1',
    name: 'DB_PASSWORD',
    reference: 'my-app/prod/db-password',
    status: 'synced',
    source: 'Prod secret manager',
    sourceIcon: 'aws',
    lastSync: '32 min ago',
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
    lastSync: '32 min ago',
  },
  {
    id: '3',
    name: 'API_SECRET_KEY',
    reference: 'my-app/prod/api-keys',
    status: 'synced',
    source: 'Prod secret manager',
    sourceIcon: 'aws',
    lastSync: '32 min ago',
  },
  {
    id: '4',
    name: 'APP_SECRET_KEY',
    reference: 'prod/app/backend/payment/datab...',
    status: 'broken',
    source: 'GCP secret manager',
    sourceIcon: 'gcp',
    lastSync: '32 min ago',
  },
  {
    id: '5',
    name: 'SMTP_PASSWORD',
    reference: 'my-app/prod/smtp-credentials',
    status: 'broken',
    source: 'Prod secret manager',
    sourceIcon: 'aws',
    lastSync: '32 min ago',
  },
  {
    id: '6',
    name: 'REDIS_PASSWORD',
    reference: 'my-app/prod/redis-auth',
    status: 'detached',
    source: null,
    lastSync: '32 min ago',
  },
  {
    id: '7',
    name: 'AWS_SECRET_KEY',
    reference: 'my-app/prod/oauth-secrets',
    status: 'detached',
    source: null,
    lastSync: '32 min ago',
  },
  {
    id: '8',
    name: 'GCP_API_KEY',
    reference: 'my-app/prod/billing-keys',
    status: 'detached',
    source: null,
    lastSync: '32 min ago',
  },
]

const EMPTY_SECRETS: ExternalSecret[] = []

export const EXTERNAL_SECRETS_USE_CASES: { id: ExternalSecretsUseCaseId; label: string }[] = [
  { id: 'filled', label: 'Filled' },
  { id: 'secret-manager-addon-not-detected', label: 'Secret manager add-on not detected' },
  { id: 'secret-manager-addon-no-manager', label: 'Secret manager add-on with no manager' },
  { id: 'secret-manager-addon-not-redeployed', label: 'Secret manager add-on not redeployed' },
  { id: 'empty', label: 'No secrets yet' },
]

type SecretSourceOption = {
  value: 'aws-manager' | 'aws-parameter' | 'gcp-secret'
  label: string
  tableLabel: string
  icon: 'aws' | 'gcp'
}

const SECRET_SOURCES: SecretSourceOption[] = [
  {
    value: 'aws-manager',
    label: 'AWS Manager type',
    tableLabel: 'Prod secret manager',
    icon: 'aws',
  },
  {
    value: 'aws-parameter',
    label: 'AWS Parameter store',
    tableLabel: 'AWS Parameter store',
    icon: 'aws',
  },
  {
    value: 'gcp-secret',
    label: 'GCP Secret manager',
    tableLabel: 'GCP secret manager',
    icon: 'gcp',
  },
]

const REFERENCE_OPTIONS = [
  'my-app/prod/db-password',
  'my-app/prod/api-key',
  'my-app/prod/secret-token',
  'my-app/prod/user-credentials',
  'my-app/prod/payment-gateway',
  'my-app/prod/db-host',
  'my-app/prod/db-port',
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

const gridLayoutClassName = 'grid w-full grid-cols-[32px_minmax(0,2fr)_minmax(0,2fr)_110px_minmax(0,1.5fr)_110px_80px]'

const columnHelper = createColumnHelper<ExternalSecret>()

interface AddSecretModalProps {
  defaultSource?: SecretSourceOption
  isFile?: boolean
  mode?: 'create' | 'edit'
  initialSecret?: ExternalSecret
  onClose: () => void
  onSubmit: (secret: Omit<ExternalSecret, 'id' | 'lastSync' | 'status'>) => void
}

type AddSecretFormValues = {
  source: SecretSourceOption['value']
  reference: string
  path: string
  secretName: string
  description: string
}

function AddSecretModal({
  defaultSource,
  isFile = false,
  mode = 'create',
  initialSecret,
  onClose,
  onSubmit,
}: AddSecretModalProps) {
  const methods = useForm<AddSecretFormValues>({
    defaultValues: {
      source: defaultSource?.value ?? SECRET_SOURCES[0].value,
      reference: initialSecret?.reference ?? '',
      path: initialSecret?.filePath ?? '',
      secretName: initialSecret?.name ?? '',
      description: initialSecret?.description ?? '',
    },
    mode: 'onChange',
  })
  const { enableAlertClickOutside } = useModal()
  const [referenceInput, setReferenceInput] = useState('')

  const secretNameValue = methods.watch('secretName')

  const handleSubmit = methods.handleSubmit((data) => {
    const finalReference = data.reference || referenceInput || REFERENCE_OPTIONS[0]
    const finalName = data.secretName.trim() || finalReference.split('/').pop()?.toUpperCase() || 'NEW_SECRET'
    const selectedSource = SECRET_SOURCES.find((option) => option.value === data.source) ?? SECRET_SOURCES[0]
    const descriptionValue = data.description.trim()
    const fallbackFilePath = `/vault/secrets/${finalReference.split('/').pop() || 'secret'}`
    const finalPath = data.path.trim() || fallbackFilePath

    onSubmit({
      name: finalName,
      description: descriptionValue ? descriptionValue : undefined,
      filePath: isFile ? finalPath : undefined,
      isFile,
      reference: finalReference,
      source: selectedSource.tableLabel,
      sourceIcon: selectedSource.icon,
    })
    onClose()
  })

  useEffect(() => {
    enableAlertClickOutside(methods.formState.isDirty)
  }, [enableAlertClickOutside, methods.formState.isDirty])

  useEffect(() => {
    methods.trigger().then()
  }, [methods.trigger])

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title={
          isFile
            ? mode === 'edit'
              ? 'Edit secret as file'
              : 'Add secret as file'
            : mode === 'edit'
              ? 'Edit secret'
              : 'Add secret'
        }
        description={
          isFile
            ? mode === 'edit'
              ? 'Edit an external secret file to use on this service. Qovery will resolve its value at deployment and mount it inside your container.'
              : 'Add an external secret file to use on this service. Qovery will resolve its value at deployment and mount it inside your container.'
            : mode === 'edit'
              ? 'Edit an external secret to use on this service. Qovery will resolve its value at deployment.'
              : 'Add an external secret to use on this service. Qovery will resolve its value at deployment.'
        }
        onSubmit={handleSubmit}
        onClose={onClose}
        submitLabel={mode === 'edit' ? 'Edit secret' : 'Add secret'}
      >
        <>
          <Controller
            name="source"
            control={methods.control}
            render={({ field }) => (
              <InputSelect
                className="mb-3 w-full"
                name={field.name}
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

          <Controller
            name="reference"
            control={methods.control}
            render={({ field }) => (
              <InputSelect
                className="mb-3 w-full"
                name={field.name}
                label="Reference"
                options={REFERENCE_OPTIONS.map((reference) => ({ label: reference, value: reference }))}
                value={field.value}
                onChange={(value) => {
                  const selected = value as string
                  field.onChange(selected)
                  if (!secretNameValue) {
                    const inferredName = selected.split('/').pop()?.toUpperCase()
                    if (inferredName) {
                      methods.setValue('secretName', inferredName, { shouldValidate: true })
                    }
                  }
                }}
                onInputChange={(value) => setReferenceInput(value)}
                isSearchable
                isCreatable
                placeholder="Reference"
              />
            )}
          />

          {isFile && (
            <Controller
              name="path"
              control={methods.control}
              render={({ field }) => (
                <InputText
                  className="mb-3 w-full"
                  name={field.name}
                  label="Path"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          )}

          <Controller
            name="secretName"
            control={methods.control}
            render={({ field }) => (
              <InputText
                className="mb-3 w-full"
                name={field.name}
                label="Secret name"
                value={field.value}
                onChange={field.onChange}
                hint="Name that other Qovery services will use"
              />
            )}
          />

          <Controller
            name="description"
            control={methods.control}
            render={({ field }) => (
              <InputTextArea
                className="mb-6 w-full"
                label="Description"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </>
      </ModalCrud>
    </FormProvider>
  )
}

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
                name={field.name}
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

  const handleSynchronize = useCallback((secretIds?: string[]) => {
    const targetIds = secretIds ? new Set(secretIds) : null
    const shouldSync = (secret: ExternalSecret) => !targetIds || targetIds.has(secret.id)
    setSecrets((prev) =>
      prev.map((s) =>
        shouldSync(s) && (s.status === 'synced' || s.status === 'broken') ? { ...s, status: 'syncing' as const } : s
      )
    )
    setTimeout(() => {
      setSecrets((prev) =>
        prev.map((s) => (shouldSync(s) && s.status === 'syncing' ? { ...s, status: 'synced' as const } : s))
      )
    }, 3000)
  }, [])

  const getSourceOption = useCallback((secret?: ExternalSecret) => {
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
                  lastSync: 'just now',
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
    (secret: ExternalSecret) => {
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
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button color="neutral" size="md" variant="solid" className="gap-2" type="button">
                <Icon iconName="circle-plus" iconStyle="regular" />
                Add secret manager
              </Button>
              <Button color="neutral" size="md" variant="outline" className="gap-2" type="button">
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
        filterFn: (row, columnId, filterValue) => {
          if (!Array.isArray(filterValue) || filterValue.length === 0) return true
          return filterValue.includes(row.getValue(columnId))
        },
        cell: (info) => <SyncStatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor((row) => row.source ?? 'No source', {
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
            return <span className="text-sm text-neutral">No source</span>
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
      columnHelper.accessor('lastSync', {
        header: 'Last sync',
        enableSorting: false,
        cell: (info) => <span className="text-sm text-neutral-subtle">{info.getValue()}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        cell: (info) => {
          const secret = info.row.original
          const isSyncing = secret.status === 'syncing'
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                aria-label="Edit"
                color="neutral"
                size="xs"
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
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <Button aria-label="Other actions" color="neutral" size="xs" variant="outline" iconOnly disabled={isSyncing}>
                    <Tooltip content="Other actions">
                      <div className="flex h-full w-full items-center justify-center">
                        <Icon iconName="ellipsis-vertical" iconStyle="regular" />
                      </div>
                    </Tooltip>
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end">
                  <DropdownMenu.Item
                    icon={<Icon iconName="rotate" />}
                    disabled={isSyncing}
                    onSelect={() => handleSynchronize([secret.id])}
                  >
                    Synchronize
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    icon={<Icon iconName="trash" />}
                    color="red"
                    disabled={isSyncing}
                    onSelect={() => handleConfirmDeleteSecrets([secret.id])}
                  >
                    Delete
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>
          )
        },
      }),
    ],
    [handleConfirmDeleteSecrets, handleOpenEditSecret, handleSynchronize]
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
          <span className="text-sm font-medium text-neutral">{countText}</span>
          <div className="flex items-center gap-2">
            <TableFilterSearch
              className="h-8 w-[200px]"
              placeholder="Search secrets"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button color="neutral" variant="outline" size="md" className="gap-2" onClick={() => handleSynchronize()}>
              <Icon iconName="rotate" iconStyle="regular" />
              Synchronize secrets
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
        <Table.Root className="w-full min-w-[800px] text-xs" containerClassName="border-0 rounded-none">
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
                    {['status', 'source'].includes(header.column.id) ? (
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
                onClick={() => handleSynchronize(selectedIds)}
              >
                <Icon iconName="rotate" iconStyle="regular" />
                Synchronize
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
