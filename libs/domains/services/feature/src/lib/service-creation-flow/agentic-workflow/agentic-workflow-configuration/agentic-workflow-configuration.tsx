import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import {
  APIVariableTypeEnum,
  type EnvironmentModeEnum,
  type GitProviderEnum,
  type GitRepository,
  type OrganizationEnvironmentResponse,
  type VariableResponse,
} from 'qovery-typescript-axios'
import {
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { FormProvider, useForm } from 'react-hook-form'
import { useClusters } from '@qovery/domains/clusters/feature'
import {
  GitBranchSettings,
  GitProviderSetting,
  GitRepositorySetting,
  useOrganization,
} from '@qovery/domains/organizations/feature'
import { useProjects } from '@qovery/domains/projects/feature'
import { type AnyService } from '@qovery/domains/services/data-access'
import { type CreateUpdateVariableModalSubmitData, VariableFormModal } from '@qovery/domains/variables/feature'
import { IconEnum } from '@qovery/shared/enums'
import { useUserAccount } from '@qovery/shared/iam/feature'
import { type VariableData } from '@qovery/shared/interfaces'
import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  CodeEditor,
  DropdownMenu,
  Icon,
  InputSelect,
  LoaderSpinner,
  Modal,
  SegmentedControl,
  Sheet,
  useModal,
} from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { queries } from '@qovery/state/util-queries'
import { useEnvironment } from '../../../hooks/use-environment/use-environment'
import { ServiceAvatar } from '../../../service-avatar/service-avatar'
import {
  type AgenticWorkflowEnvironmentContext,
  type AgenticWorkflowGitRepository,
  type AgenticWorkflowMcpAuthType,
  type AgenticWorkflowMcpServer,
  type AgenticWorkflowOutput,
  type AgenticWorkflowProvider,
  type AgenticWorkflowSkill,
  type AgenticWorkflowSkillSource,
  useAgenticWorkflowCreateContext,
} from '../agentic-workflow-context'
import { InstructionsEditor } from './instructions-editor'

type SettingsSection = 'information' | 'resources' | 'environment' | 'network' | 'cost' | 'access' | 'docker'
type SheetView = 'provider' | 'mcp' | 'skills' | null

const PROVIDERS = {
  openai: {
    name: 'OpenAI',
    models: ['GPT-5.5', 'GPT-5.6', 'GPT-5.6 Luna'],
  },
  anthropic: {
    name: 'Anthropic',
    models: ['Claude Sonnet 4', 'Claude Haiku 4'],
  },
} as const

const MCP_AUTH_OPTIONS: { label: string; value: AgenticWorkflowMcpAuthType }[] = [
  { label: 'None', value: 'none' },
  { label: 'Headers', value: 'headers' },
  { label: 'Token', value: 'token' },
  { label: 'OAuth', value: 'oauth' },
]

const SKILL_SOURCE_LABELS: Record<AgenticWorkflowSkillSource, string> = {
  repository: 'Git repository',
  import: 'Import',
  scratch: 'Create',
}

export function getJsonError(value: string, required = false) {
  if (!value.trim()) return required ? 'Please enter a valid JSON configuration.' : undefined

  try {
    JSON.parse(value)
    return undefined
  } catch {
    return 'Invalid JSON format.'
  }
}

export function isGitRepositoryComplete(repository: AgenticWorkflowGitRepository) {
  return Boolean(
    (repository.gitTokenId || repository.provider || repository.isPublicRepository) &&
      repository.repository.trim() &&
      repository.branch.trim()
  )
}

export function isOutputComplete(output: AgenticWorkflowOutput) {
  return Boolean(output.url.trim())
}

function formatMcpJson(servers: AgenticWorkflowMcpServer[], linkedIds: string[]) {
  const linkedServers = servers.filter((server) => linkedIds.includes(server.id))

  if (linkedServers.length === 0) return ''

  return JSON.stringify(
    {
      mcpServers: Object.fromEntries(
        linkedServers.map((server) => [
          server.name.toLowerCase().replace(/\s+/g, '-'),
          {
            type: 'http',
            url: server.url,
            ...(server.headers.trim() ? { headers: JSON.parse(server.headers) } : {}),
            ...(server.authType === 'token' && server.token.trim()
              ? { headers: { Authorization: 'Bearer {{MCP_TOKEN}}' } }
              : {}),
          },
        ])
      ),
    },
    null,
    2
  )
}

interface FieldProps {
  children?: ReactNode
  hint?: string
  label: string
}

function Field({ children, hint, label }: FieldProps) {
  return (
    <label className="flex w-full flex-col gap-1 text-sm text-neutral-subtle">
      <span>{label}</span>
      {children}
      {hint ? <span className="text-ssm text-neutral-subtle">{hint}</span> : null}
    </label>
  )
}

interface TextFieldProps extends Omit<ComponentPropsWithoutRef<'input'>, 'className'> {
  label: string
}

function TextField({ label, ...props }: TextFieldProps) {
  return (
    <Field label={label}>
      <input
        {...props}
        className="h-10 w-full rounded-md border border-neutral bg-surface-neutral-component px-3 text-sm text-neutral outline-none placeholder:text-neutral-disabled focus:border-neutral-componentHover focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-strong"
      />
    </Field>
  )
}

interface SelectFieldProps {
  disabled?: boolean
  label: string
  onChange: (value: string) => void
  options: Array<string | { label: string; value: string }>
  value: string
}

function SelectField({ disabled, label, onChange, options, value }: SelectFieldProps) {
  const normalizedOptions = options.map((option) =>
    typeof option === 'string' ? { label: option, value: option } : option
  )

  return (
    <Field label={label}>
      <div className="relative">
        <select
          disabled={disabled}
          className="h-10 w-full appearance-none rounded-md border border-neutral bg-surface-neutral-component px-3 pr-9 text-sm text-neutral outline-none focus:border-neutral-componentHover focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-strong disabled:text-neutral-disabled"
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
        >
          {normalizedOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon
          iconName="chevron-down"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-subtle"
        />
      </div>
    </Field>
  )
}

function InlineTitle({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <h1
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      className="min-h-12 max-w-[760px] text-[36px] font-medium leading-[48px] text-neutral outline-none"
      onBlur={(event) => {
        const nextValue = event.currentTarget.textContent?.trim() || 'New agent'
        onChange(nextValue)
        event.currentTarget.textContent = nextValue
      }}
    >
      {value}
    </h1>
  )
}

function ContextCard({
  description,
  icon,
  onClick,
  title,
}: {
  description: string
  icon: ReactNode
  onClick: () => void
  title: string
}) {
  return (
    <Button
      type="button"
      variant="outline"
      color="neutral"
      className="h-[140px] w-80 flex-col items-start justify-between whitespace-normal rounded-lg p-4 text-left"
      onClick={onClick}
    >
      <span className="text-base text-neutral">{icon}</span>
      <span className="flex flex-col gap-0.5">
        <span className="text-ssm font-medium leading-[18px] text-neutral">{title}</span>
        <span className="text-xs font-normal leading-4 text-neutral-subtle">{description}</span>
      </span>
    </Button>
  )
}

export function ContextMenu({ onAddGit, onAddQovery }: { onAddGit: () => void; onAddQovery: () => void }) {
  return (
    <div className="flex">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button type="button" variant="outline" color="neutral" size="sm">
            Add context
            <Icon iconName="angle-down" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content className="z-dropdown w-64">
          <DropdownMenu.Item
            color="neutral"
            icon={<Icon name={IconEnum.QOVERY} width={14} height={14} />}
            onClick={onAddQovery}
          >
            From Qovery environment
          </DropdownMenu.Item>
          <DropdownMenu.Item color="neutral" icon={<Icon iconName="github" iconStyle="brands" />} onClick={onAddGit}>
            From Git repository
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  )
}

function CompactContextCard({
  badge,
  badgeClassName,
  badgeIcon,
  children,
  onClick,
}: {
  badge: string
  badgeClassName?: string
  badgeIcon: ReactNode
  children: ReactNode
  onClick: () => void
}) {
  return (
    <div className="relative flex h-[74px] min-w-0 flex-col justify-between rounded-lg border border-neutral bg-surface-neutral p-3 pr-12">
      <div className="flex items-center gap-2">
        <span
          className={twMerge(
            'flex h-5 items-center gap-1 rounded bg-surface-neutral-component px-1.5 text-[10px] font-medium uppercase leading-5 text-neutral',
            badgeClassName
          )}
        >
          {badgeIcon}
          {badge}
        </span>
      </div>
      <div className="min-w-0 truncate text-sm text-neutral">{children}</div>
      <Button
        type="button"
        variant="outline"
        color="neutral"
        size="xs"
        iconOnly
        aria-label="Manage context"
        className="absolute right-3 top-1/2 -translate-y-1/2"
        onClick={onClick}
      >
        <Icon iconName="gear" />
      </Button>
    </div>
  )
}

interface SelectableEnvironment extends Pick<OrganizationEnvironmentResponse, 'id' | 'mode' | 'name'> {
  projectId: string
  projectName: string
}

function EnvironmentModeBadge({ mode }: { mode: EnvironmentModeEnum }) {
  const labels: Record<EnvironmentModeEnum, string> = {
    PRODUCTION: 'P',
    DEVELOPMENT: 'D',
    PREVIEW: 'E',
    STAGING: 'S',
  }
  const colors: Record<EnvironmentModeEnum, 'red' | 'neutral' | 'purple'> = {
    PRODUCTION: 'red',
    DEVELOPMENT: 'neutral',
    PREVIEW: 'purple',
    STAGING: 'neutral',
  }

  return (
    <Badge variant="outline" color={colors[mode]} className="flex h-4 w-4 justify-center rounded p-0 font-semibold">
      {labels[mode]}
    </Badge>
  )
}

function ContextServiceAvatar({ service }: { service: AnyService }) {
  if (service.serviceType === 'JOB') {
    return (
      <ServiceAvatar
        size="custom"
        className="h-5 w-5"
        service={{
          icon_uri: service.icon_uri ?? '',
          serviceType: service.serviceType,
          job_type: service.job_type,
        }}
      />
    )
  }

  return (
    <ServiceAvatar
      size="custom"
      className="h-5 w-5"
      service={{ icon_uri: service.icon_uri ?? '', serviceType: service.serviceType }}
    />
  )
}

function EnvironmentContextModal({
  context,
  lockedClusterId,
  onRemove,
  onSave,
  setOpen,
}: {
  context?: AgenticWorkflowEnvironmentContext
  lockedClusterId?: string
  onRemove?: () => void
  onSave: (context: AgenticWorkflowEnvironmentContext) => void
  setOpen?: (open: boolean) => void
}) {
  const { organizationId = '' } = useParams({ strict: false })
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchMenuPosition, setSearchMenuPosition] = useState({ left: 0, top: 0, width: 0 })
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [selectedEnvironment, setSelectedEnvironment] = useState<SelectableEnvironment | undefined>(
    context
      ? {
          id: context.environmentId,
          mode: context.environmentMode,
          name: context.environmentName,
          projectId: context.projectId,
          projectName: context.projectName,
        }
      : undefined
  )
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(context?.services.map(({ id }) => id) ?? [])
  const initializedEnvironmentId = useRef(context?.environmentId)
  const { data: environments = [], isLoading: isLoadingEnvironments } = useQuery({
    ...queries.organizations.environments({ organizationId }),
    enabled: Boolean(organizationId),
  })
  const { data: projects = [] } = useProjects({
    organizationId,
    enabled: Boolean(organizationId),
  })
  const { data: environment } = useEnvironment({
    environmentId: selectedEnvironment?.id ?? '',
  })
  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    ...queries.services.list(selectedEnvironment?.id ?? ''),
    enabled: Boolean(selectedEnvironment?.id),
    select: (services) => [...services].sort(({ name: nameA }, { name: nameB }) => nameA.localeCompare(nameB)),
  })
  const normalizedSearch = search.trim().toLowerCase()
  const filteredEnvironments = environments
    .map((candidate) => ({
      id: candidate.id,
      mode: candidate.mode,
      name: candidate.name,
      projectId: candidate.project.id,
      projectName: projects.find(({ id }) => id === candidate.project.id)?.name ?? '',
    }))
    .filter(
      ({ name, projectName }) =>
        !normalizedSearch ||
        name.toLowerCase().includes(normalizedSearch) ||
        projectName.toLowerCase().includes(normalizedSearch)
    )
  const clusterMismatch = Boolean(
    lockedClusterId && environment?.cluster_id && lockedClusterId !== environment.cluster_id
  )

  useEffect(() => {
    if (!selectedEnvironment || services.length === 0 || initializedEnvironmentId.current === selectedEnvironment.id) {
      return
    }

    setSelectedServiceIds(services.map(({ id }) => id))
    initializedEnvironmentId.current = selectedEnvironment.id
  }, [selectedEnvironment, services])

  useEffect(() => {
    if (!searchOpen) return

    const updatePosition = () => {
      const rect = searchInputRef.current?.getBoundingClientRect()
      if (!rect) return

      setSearchMenuPosition({
        left: rect.left,
        top: rect.bottom + 8,
        width: rect.width,
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [searchOpen])

  const selectEnvironment = (nextEnvironment: SelectableEnvironment) => {
    initializedEnvironmentId.current = undefined
    setSelectedServiceIds([])
    setSelectedEnvironment(nextEnvironment)
    setSearch('')
  }

  const close = () => setOpen?.(false)

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex flex-col gap-1 pr-8">
        <h2 className="text-xl font-medium leading-7 text-neutral">Import from existing Qovery environment</h2>
        <p className="text-sm leading-5 text-neutral-subtle">
          Link a Qovery environment. Your agent will run in the same cluster and access its services and data as
          context.
        </p>
      </div>

      {selectedEnvironment ? (
        <>
          <div className="flex h-11 items-center gap-2 rounded-md border border-neutral bg-surface-neutral-component px-3">
            <EnvironmentModeBadge mode={selectedEnvironment.mode} />
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="truncate text-sm font-medium text-neutral">{selectedEnvironment.name}</span>
              <span className="truncate text-sm text-neutral-subtle">{selectedEnvironment.projectName}</span>
            </div>
            <Button
              type="button"
              variant="plain"
              color="neutral"
              size="xs"
              onClick={() => {
                setSelectedEnvironment(undefined)
                setSelectedServiceIds([])
              }}
            >
              Edit
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral">Services to include</span>
            <Button
              type="button"
              variant="plain"
              color="neutral"
              size="xs"
              onClick={() =>
                setSelectedServiceIds(selectedServiceIds.length === services.length ? [] : services.map(({ id }) => id))
              }
            >
              {selectedServiceIds.length === services.length ? 'Unselect all' : 'Select all'}
            </Button>
          </div>

          {isLoadingServices ? (
            <div className="flex h-24 items-center justify-center">
              <LoaderSpinner />
            </div>
          ) : (
            <div className="flex max-h-[300px] flex-col gap-2 overflow-auto">
              {services.map((service) => {
                const checked = selectedServiceIds.includes(service.id)

                return (
                  <label
                    key={service.id}
                    className="flex cursor-pointer items-center gap-3 rounded-md border border-neutral bg-surface-neutral-subtle px-3 py-2.5"
                  >
                    <ContextServiceAvatar service={service} />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral">{service.name}</span>
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(nextChecked) =>
                        setSelectedServiceIds((current) =>
                          nextChecked
                            ? [...current, service.id]
                            : current.filter((serviceId) => serviceId !== service.id)
                        )
                      }
                    />
                  </label>
                )
              })}
              {services.length === 0 ? (
                <p className="py-6 text-center text-sm text-neutral-subtle">No service found in this environment.</p>
              ) : null}
            </div>
          )}

          {clusterMismatch ? (
            <p className="text-sm text-negative">
              This environment runs on another cluster. Choose an environment from the linked cluster.
            </p>
          ) : null}

          <div className="flex items-center justify-between">
            <div>
              {onRemove ? (
                <Button type="button" variant="plain" color="red" size="md" onClick={onRemove}>
                  Remove
                </Button>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="plain" color="neutral" size="md" onClick={close}>
                Cancel
              </Button>
              <Button
                type="button"
                size="md"
                disabled={!environment || selectedServiceIds.length === 0 || clusterMismatch}
                onClick={() => {
                  if (!environment) return

                  onSave({
                    id: context?.id ?? crypto.randomUUID(),
                    environmentId: environment.id,
                    environmentName: environment.name,
                    environmentMode: environment.mode,
                    projectId: selectedEnvironment.projectId,
                    projectName: selectedEnvironment.projectName,
                    clusterId: environment.cluster_id,
                    services: services
                      .filter(({ id }) => selectedServiceIds.includes(id))
                      .map(({ id, name, service_type }) => ({ id, name, serviceType: service_type })),
                  })
                  close()
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="relative">
          <Icon
            iconName="magnifying-glass"
            className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-sm text-neutral-subtle"
          />
          <input
            ref={searchInputRef}
            value={search}
            placeholder="Search for an environment..."
            className="h-10 w-full rounded-md border border-neutral bg-surface-neutral-component pl-9 pr-3 text-sm text-neutral outline-none placeholder:text-neutral-disabled focus:border-neutral-componentHover"
            onChange={(event) => setSearch(event.currentTarget.value)}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setSearchOpen(false)}
          />
          {searchOpen && typeof document !== 'undefined'
            ? createPortal(
                <div
                  className="fixed z-dropdown flex max-h-[276px] flex-col gap-1 overflow-auto rounded-md border border-neutral bg-surface-neutral p-2 shadow-lg"
                  style={searchMenuPosition}
                  onMouseDown={(event) => event.preventDefault()}
                >
                  {filteredEnvironments.map((candidate) => (
                    <button
                      key={candidate.id}
                      type="button"
                      className="flex h-8 w-full shrink-0 items-center gap-2 rounded px-1.5 text-left hover:bg-surface-neutral-component"
                      onClick={() => selectEnvironment(candidate)}
                    >
                      <EnvironmentModeBadge mode={candidate.mode} />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral">{candidate.name}</span>
                      <span className="max-w-[45%] truncate text-sm text-neutral-subtle">{candidate.projectName}</span>
                    </button>
                  ))}
                  {isLoadingEnvironments ? (
                    <div className="flex h-16 items-center justify-center">
                      <LoaderSpinner />
                    </div>
                  ) : filteredEnvironments.length === 0 ? (
                    <p className="px-2 py-4 text-center text-sm text-neutral-subtle">No environment found.</p>
                  ) : null}
                </div>,
                document.body
              )
            : null}
        </div>
      )}
    </div>
  )
}

interface GitContextForm {
  provider?: keyof typeof GitProviderEnum | string | null
  is_public_repository?: boolean
  repository: string
  branch: string
  git_token_name?: string | null
  git_token_id?: string | null
  git_repository?: GitRepository
}

function GitContextModal({
  context,
  onRemove,
  onSave,
  setOpen,
}: {
  context?: AgenticWorkflowGitRepository
  onRemove?: () => void
  onSave: (context: AgenticWorkflowGitRepository) => void
  setOpen?: (open: boolean) => void
}) {
  const { organizationId = '' } = useParams({ strict: false })
  const methods = useForm<GitContextForm>({
    defaultValues: {
      provider: context?.provider,
      is_public_repository: context?.isPublicRepository,
      repository: context?.repository ?? '',
      branch: context?.branch ?? '',
      git_token_name: context?.gitTokenName,
      git_token_id: context?.gitTokenId,
      git_repository: context?.gitRepository,
    },
    mode: 'onChange',
  })
  const provider = methods.watch('provider') as keyof typeof GitProviderEnum | undefined
  const gitTokenId = methods.watch('git_token_id') ?? undefined
  const repository = methods.watch('repository')
  const isPublicRepository = methods.watch('is_public_repository')
  const close = () => setOpen?.(false)

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col gap-5 p-5">
        <div className="flex flex-col gap-1 pr-8">
          <h2 className="text-xl font-medium leading-7 text-neutral">Import context from Git repository</h2>
          <p className="text-sm leading-5 text-neutral-subtle">
            Link a repository so the agent can use its code and documentation as context.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <GitProviderSetting organizationId={organizationId} portal />
          {!isPublicRepository && provider ? (
            <GitRepositorySetting
              organizationId={organizationId}
              gitProvider={provider}
              gitTokenId={gitTokenId}
              portal
            />
          ) : null}
          {!isPublicRepository && provider && repository ? (
            <GitBranchSettings
              organizationId={organizationId}
              gitProvider={provider}
              gitTokenId={gitTokenId}
              hideRootPath
              portal
            />
          ) : null}
        </div>
        <div className="flex items-center justify-between">
          <div>
            {onRemove ? (
              <Button type="button" variant="plain" color="red" size="md" onClick={onRemove}>
                Remove
              </Button>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="plain" color="neutral" size="md" onClick={close}>
              Cancel
            </Button>
            <Button
              type="button"
              size="md"
              onClick={methods.handleSubmit((values) => {
                onSave({
                  provider: values.provider,
                  gitTokenId: values.git_token_id,
                  gitTokenName: values.git_token_name,
                  isPublicRepository: values.is_public_repository,
                  repository: values.repository,
                  gitRepository: values.git_repository,
                  branch: values.branch,
                })
                close()
              })}
            >
              Import
            </Button>
          </div>
        </div>
      </div>
    </FormProvider>
  )
}

function AddRowButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <Button type="button" variant="plain" color="neutral" size="sm" className="text-neutral-subtle" onClick={onClick}>
      <Icon iconName="circle-plus" />
      {children}
    </Button>
  )
}

function LinkedBadge({ children, icon, onClick }: { children: ReactNode; icon: ReactNode; onClick: () => void }) {
  return (
    <Button type="button" variant="outline" color="neutral" size="sm" onClick={onClick}>
      {icon}
      {children}
    </Button>
  )
}

function AgentSettingRow({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="flex min-h-11 items-center gap-4 py-1">
      <span className="w-24 shrink-0 text-sm font-medium text-neutral-subtle">{label}</span>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 px-1">{children}</div>
    </div>
  )
}

function OverlaySheet({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-modal flex justify-end bg-background-overlay" onClick={onClose}>
      <div onClick={(event) => event.stopPropagation()}>
        <Sheet open className="w-[520px] max-w-[calc(100vw-24px)] shadow-none" onClose={onClose}>
          {children}
        </Sheet>
      </div>
    </div>
  )
}

function SheetHeader({ description, onClose, title }: { description?: string; onClose: () => void; title: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 pb-4 pt-5">
      <div className="flex min-w-0 flex-col gap-1">
        <h2 className="text-xl font-medium leading-7 text-neutral">{title}</h2>
        {description ? <p className="max-w-[440px] text-sm leading-5 text-neutral-subtle">{description}</p> : null}
      </div>
      <Button type="button" variant="plain" color="neutral" size="xs" iconOnly aria-label="Close" onClick={onClose}>
        <Icon iconName="xmark" />
      </Button>
    </div>
  )
}

function ProviderFields({
  provider,
  setProvider,
}: {
  provider: AgenticWorkflowProvider
  setProvider: (provider: AgenticWorkflowProvider) => void
}) {
  const providerOptions = Object.entries(PROVIDERS).map(([value, config]) => ({
    label: config.name,
    value,
  }))

  return (
    <div className="flex flex-col gap-4">
      <SelectField
        label="Provider"
        options={providerOptions}
        value={provider.id}
        onChange={(value) => {
          const id = value as AgenticWorkflowProvider['id']
          const config = PROVIDERS[id]

          setProvider({
            ...provider,
            id,
            name: config.name,
            apiKey: '',
            allowedModels: [...config.models],
            model: config.models[0],
          })
        }}
      />
      <TextField
        label="API Key"
        type="password"
        value={provider.apiKey}
        onChange={(event) => setProvider({ ...provider, apiKey: event.currentTarget.value })}
      />
      <InputSelect
        label="Allowed models"
        options={PROVIDERS[provider.id].models.map((model) => ({ label: model, value: model }))}
        value={provider.allowedModels}
        onChange={(value) => {
          const allowedModels = value as string[]

          if (allowedModels.length === 0) return

          setProvider({
            ...provider,
            allowedModels,
            model: allowedModels.includes(provider.model) ? provider.model : allowedModels[0],
          })
        }}
        isMulti
        portal
      />
      <SelectField
        label="Default model"
        options={provider.allowedModels}
        value={provider.model}
        onChange={(model) => setProvider({ ...provider, model })}
      />
      <SelectField
        label="Default effort"
        options={['Low', 'Medium', 'High']}
        value={provider.effort}
        onChange={(effort) => setProvider({ ...provider, effort })}
      />
    </div>
  )
}

function newProvider(provider?: AgenticWorkflowProvider): AgenticWorkflowProvider {
  return (
    provider ?? {
      id: 'openai',
      name: 'OpenAI',
      apiKey: '',
      allowedModels: [...PROVIDERS.openai.models],
      model: PROVIDERS.openai.models[0],
      effort: 'High',
    }
  )
}

function ProviderModal({
  onSave,
  provider: initialProvider,
  setOpen,
}: {
  onSave: (provider: AgenticWorkflowProvider) => void
  provider?: AgenticWorkflowProvider
  setOpen?: (open: boolean) => void
}) {
  const [provider, setProvider] = useState(() => newProvider(initialProvider))

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex flex-col gap-1 pr-8">
        <h2 className="text-xl font-medium leading-7 text-neutral">Add provider</h2>
        <p className="text-sm leading-5 text-neutral-subtle">
          Choose and configure the provider this agent will use across all its sessions.
        </p>
      </div>
      <ProviderFields provider={provider} setProvider={setProvider} />
      <Button
        type="button"
        size="lg"
        className="w-fit"
        disabled={!provider.apiKey.trim()}
        onClick={() => {
          onSave(provider)
          setOpen?.(false)
        }}
      >
        Confirm
      </Button>
    </div>
  )
}

function ProviderSheet({ onClose }: { onClose: () => void }) {
  const { form } = useAgenticWorkflowCreateContext()
  const currentProvider = form.watch('provider')
  const [provider, setProvider] = useState(() => newProvider(currentProvider))

  return (
    <OverlaySheet onClose={onClose}>
      <SheetHeader
        title="Manage provider"
        description="Choose and configure the provider this agent will use across all its sessions."
        onClose={onClose}
      />
      <div className="flex flex-1 flex-col overflow-auto px-5">
        <ProviderFields provider={provider} setProvider={setProvider} />
      </div>
      <div className="flex items-center justify-between border-t border-neutral p-5">
        <Button
          type="button"
          variant="surface"
          color="red"
          size="lg"
          onClick={() => {
            form.setValue('provider', undefined, { shouldDirty: true })
            form.setValue('modelApiKey', '', { shouldDirty: true })
            onClose()
          }}
        >
          <Icon iconName="trash-can" />
          Delete
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={() => {
            form.setValue('provider', provider, { shouldDirty: true })
            form.setValue('modelApiKey', provider.apiKey, { shouldDirty: true })
            onClose()
          }}
        >
          Save changes
        </Button>
      </div>
    </OverlaySheet>
  )
}

function McpIcon({ name }: { name: string }) {
  const normalized = name.toLowerCase()

  if (normalized.includes('github')) return <Icon iconName="github" iconStyle="brands" />
  if (normalized.includes('slack')) return <Icon iconName="slack" iconStyle="brands" />
  if (normalized.includes('figma')) return <Icon iconName="figma" iconStyle="brands" />
  if (normalized.includes('jira')) return <Icon iconName="jira" iconStyle="brands" />
  if (normalized.includes('hubspot')) return <Icon iconName="hubspot" iconStyle="brands" />
  return <Icon iconName="link" />
}

function McpSheet({ onAddMcp, onClose }: { onAddMcp: () => void; onClose: () => void }) {
  const { form } = useAgenticWorkflowCreateContext()
  const values = form.watch()
  const [search, setSearch] = useState('')
  const filteredServers = values.orgMcpServers.filter((server) =>
    server.name.toLowerCase().includes(search.toLowerCase())
  )

  const toggleServer = (serverId: string) => {
    const linkedMcpServerIds = values.linkedMcpServerIds.includes(serverId)
      ? values.linkedMcpServerIds.filter((id) => id !== serverId)
      : [...values.linkedMcpServerIds, serverId]

    form.setValue('linkedMcpServerIds', linkedMcpServerIds, { shouldDirty: true })
    form.setValue('mcpJson', formatMcpJson(values.orgMcpServers, linkedMcpServerIds), { shouldDirty: true })
  }

  return (
    <OverlaySheet onClose={onClose}>
      <SheetHeader title="Manage MCP" onClose={onClose} />
      <div className="flex flex-1 flex-col gap-4 overflow-auto px-5">
        <div className="relative">
          <Icon
            iconName="magnifying-glass"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-subtle"
          />
          <input
            aria-label="Search MCP"
            placeholder="Search"
            className="h-10 w-full rounded-md border border-neutral bg-surface-neutral-component pl-9 pr-3 text-sm text-neutral outline-none placeholder:text-neutral-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-strong"
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-subtle">
            All configured MCP ({values.orgMcpServers.length})
          </span>
          <Button type="button" variant="outline" color="neutral" size="sm" onClick={onAddMcp}>
            <Icon iconName="circle-plus" />
            Add MCP
          </Button>
        </div>
        {filteredServers.length ? (
          <div className="flex flex-col">
            {filteredServers.map((server) => {
              const linked = values.linkedMcpServerIds.includes(server.id)

              return (
                <Button
                  key={server.id}
                  type="button"
                  variant="plain"
                  color="neutral"
                  className="h-11 w-full justify-start gap-3 px-0"
                  onClick={() => toggleServer(server.id)}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded border border-neutral bg-surface-neutral-component text-base text-neutral">
                    <McpIcon name={server.name} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-left text-sm font-medium text-neutral">
                    {server.name}
                  </span>
                  <Icon
                    iconName={linked ? 'circle-check' : 'plus'}
                    className={linked ? 'text-positive' : 'text-neutral-subtle'}
                  />
                </Button>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 pb-24 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-md border border-neutral text-neutral-subtle">
              <Icon iconName="plug" />
            </span>
            <div className="flex max-w-64 flex-col gap-1">
              <p className="text-sm font-medium text-neutral">No MCP configured</p>
              <p className="text-ssm text-neutral-subtle">Add an organization MCP, then link it to this agent.</p>
            </div>
            <Button type="button" variant="outline" color="neutral" size="sm" onClick={onAddMcp}>
              <Icon iconName="circle-plus" />
              Add MCP
            </Button>
          </div>
        )}
      </div>
      <div className="border-t border-neutral p-5">
        <Button type="button" className="w-full justify-center" size="lg" onClick={onClose}>
          Save
        </Button>
      </div>
    </OverlaySheet>
  )
}

interface HeaderRow {
  id: string
  key: string
  value: string
}

function McpServerModal({ setOpen }: { setOpen?: (open: boolean) => void }) {
  const { form } = useAgenticWorkflowCreateContext()
  const values = form.watch()
  const [name, setName] = useState('My MCP')
  const [url, setUrl] = useState('https://mcp.url.com')
  const [authType, setAuthType] = useState<AgenticWorkflowMcpAuthType>('none')
  const [token, setToken] = useState('')
  const [headers, setHeaders] = useState<HeaderRow[]>([])
  const canCreate = Boolean(name.trim() && url.trim())

  const addHeader = () => {
    setHeaders((current) => [...current, { id: crypto.randomUUID(), key: '', value: '' }])
  }

  const updateHeader = (id: string, field: 'key' | 'value', value: string) => {
    setHeaders((current) => current.map((header) => (header.id === id ? { ...header, [field]: value } : header)))
  }

  const createServer = () => {
    if (!canCreate) return

    const validHeaders = headers.filter((header) => header.key.trim())
    const server: AgenticWorkflowMcpServer = {
      id: crypto.randomUUID(),
      name: name.trim(),
      url: url.trim(),
      authType,
      headers: JSON.stringify(Object.fromEntries(validHeaders.map((header) => [header.key, header.value]))),
      token,
      oauthClientId: '',
      oauthClientSecret: '',
      oauthScopes: '',
    }
    const orgMcpServers = [...values.orgMcpServers, server]
    const linkedMcpServerIds = [...values.linkedMcpServerIds, server.id]

    form.setValue('orgMcpServers', orgMcpServers, { shouldDirty: true })
    form.setValue('linkedMcpServerIds', linkedMcpServerIds, { shouldDirty: true })
    form.setValue('mcpJson', formatMcpJson(orgMcpServers, linkedMcpServerIds), { shouldDirty: true })
    setOpen?.(false)
  }

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex flex-col gap-1 pr-8">
        <h2 className="text-xl font-medium leading-7 text-neutral">Add MCP</h2>
        <p className="text-sm leading-5 text-neutral-subtle">
          Choose and configure the provider this agent will use across all its sessions.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <TextField label="Name" value={name} onChange={(event) => setName(event.currentTarget.value)} />
        <TextField label="URL" value={url} onChange={(event) => setUrl(event.currentTarget.value)} />
        <SelectField
          label="Authentication type"
          options={MCP_AUTH_OPTIONS.map((option) => option.label)}
          value={MCP_AUTH_OPTIONS.find((option) => option.value === authType)?.label ?? 'None'}
          onChange={(label) => {
            const nextType = MCP_AUTH_OPTIONS.find((option) => option.label === label)?.value
            if (nextType) setAuthType(nextType)
          }}
        />
        {authType === 'token' ? (
          <TextField
            label="Token"
            type="password"
            value={token}
            onChange={(event) => setToken(event.currentTarget.value)}
          />
        ) : null}
        {authType === 'oauth' ? (
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-neutral-subtle">Not connected</span>
            <Button type="button" variant="outline" color="neutral" size="md">
              Authenticate
            </Button>
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-subtle">Headers</span>
          <Button type="button" variant="outline" color="neutral" size="xs" onClick={addHeader}>
            <Icon iconName="circle-plus" />
            Add header
          </Button>
        </div>
        {headers.map((header) => (
          <div key={header.id} className="grid grid-cols-2 gap-2">
            <input
              aria-label="Header name"
              placeholder="Authorization"
              className="h-10 rounded-md border border-neutral bg-surface-neutral-component px-3 text-sm text-neutral outline-none placeholder:text-neutral-disabled focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-strong"
              value={header.key}
              onChange={(event) => updateHeader(header.id, 'key', event.currentTarget.value)}
            />
            <input
              aria-label="Header value"
              placeholder="Bearer…"
              className="h-10 rounded-md border border-neutral bg-surface-neutral-component px-3 text-sm text-neutral outline-none placeholder:text-neutral-disabled focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-strong"
              value={header.value}
              onChange={(event) => updateHeader(header.id, 'value', event.currentTarget.value)}
            />
          </div>
        ))}
      </div>
      <Button type="button" size="lg" className="w-fit" disabled={!canCreate} onClick={createServer}>
        Confirm
      </Button>
    </div>
  )
}

function SkillsSheet({ onClose }: { onClose: () => void }) {
  const { form } = useAgenticWorkflowCreateContext()
  const values = form.watch()
  const [source, setSource] = useState<AgenticWorkflowSkillSource>('repository')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [sourceValue, setSourceValue] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const folderInputRef = useRef<HTMLInputElement | null>(null)

  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? [])
    if (!files.length) return

    const importedPath = files.map((file) => file.webkitRelativePath || file.name).join(', ')
    setSourceValue(importedPath)
    if (!name) {
      setName(files[0].name.replace(/\.md$/i, ''))
    }
  }

  const addSkill = () => {
    if (!name.trim()) return

    const skill: AgenticWorkflowSkill = {
      id: crypto.randomUUID(),
      name: name.trim(),
      description: description.trim(),
      source,
      sourceValue: sourceValue.trim(),
    }
    form.setValue('skills', [...values.skills, skill], { shouldDirty: true })
    setName('')
    setDescription('')
    setSourceValue('')
  }

  return (
    <OverlaySheet onClose={onClose}>
      <SheetHeader
        title="Manage skills"
        description="Add reusable instructions, scripts, and references that this agent can load when needed."
        onClose={onClose}
      />
      <div className="flex flex-1 flex-col gap-5 overflow-auto px-5 pb-5">
        <SegmentedControl.Root
          className="w-full"
          value={source}
          onValueChange={(value) => setSource(value as AgenticWorkflowSkillSource)}
        >
          {(['repository', 'import', 'scratch'] as AgenticWorkflowSkillSource[]).map((option) => (
            <SegmentedControl.Item key={option} value={option}>
              {SKILL_SOURCE_LABELS[option]}
            </SegmentedControl.Item>
          ))}
        </SegmentedControl.Root>
        <TextField
          label="Skill name"
          placeholder="Design review"
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
        />
        <TextField
          label="Description"
          placeholder="When should the agent use this skill?"
          value={description}
          onChange={(event) => setDescription(event.currentTarget.value)}
        />
        {source === 'repository' ? (
          <TextField
            label="Repository URL"
            placeholder="https://github.com/org/agent-skills"
            value={sourceValue}
            onChange={(event) => setSourceValue(event.currentTarget.value)}
          />
        ) : null}
        {source === 'import' ? (
          <div className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-md border border-dashed border-neutral p-5 text-center">
            <Icon iconName="folder-arrow-up" className="text-xl text-neutral-subtle" />
            <div>
              <p className="text-sm font-medium text-neutral">Drop a skill file or folder</p>
              <p className="text-ssm text-neutral-subtle">Import a SKILL.md file with its references and scripts.</p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                color="neutral"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Import file
              </Button>
              <Button
                type="button"
                variant="outline"
                color="neutral"
                size="sm"
                onClick={() => folderInputRef.current?.click()}
              >
                Import folder
              </Button>
            </div>
            <input ref={fileInputRef} hidden type="file" accept=".md,.zip" multiple onChange={handleImport} />
            <input
              ref={(input) => {
                folderInputRef.current = input
                input?.setAttribute('webkitdirectory', '')
              }}
              hidden
              type="file"
              multiple
              onChange={handleImport}
            />
            {sourceValue ? <p className="max-w-full truncate text-xs text-neutral-subtle">{sourceValue}</p> : null}
          </div>
        ) : null}
        {source === 'scratch' ? (
          <Field
            label="SKILL.md instructions"
            hint="Describe when to use the skill, the steps to follow, and any required outputs."
          >
            <textarea
              rows={8}
              placeholder={'# Design review\n\nReview the selected interface for…'}
              className="resize-none rounded-md border border-neutral bg-surface-neutral-component p-3 font-mono text-sm leading-5 text-neutral outline-none placeholder:text-neutral-disabled focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-strong"
              value={sourceValue}
              onChange={(event) => setSourceValue(event.currentTarget.value)}
            />
          </Field>
        ) : null}
        <Button type="button" size="md" className="w-fit" disabled={!name.trim()} onClick={addSkill}>
          <Icon iconName="plus" />
          Add skill
        </Button>
        {values.skills.length ? (
          <div className="flex flex-col gap-2 border-t border-neutral pt-4">
            <p className="text-sm font-medium text-neutral-subtle">Added skills ({values.skills.length})</p>
            {values.skills.map((skill) => (
              <div key={skill.id} className="flex h-11 items-center gap-3">
                <Icon iconName="wand-magic-sparkles" className="text-neutral-subtle" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral">{skill.name}</span>
                <Button
                  type="button"
                  variant="plain"
                  color="neutral"
                  size="xs"
                  iconOnly
                  aria-label={`Remove ${skill.name}`}
                  onClick={() =>
                    form.setValue(
                      'skills',
                      values.skills.filter((item) => item.id !== skill.id),
                      { shouldDirty: true }
                    )
                  }
                >
                  <Icon iconName="trash-can" />
                </Button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <div className="border-t border-neutral p-5">
        <Button type="button" className="w-full justify-center" size="lg" onClick={onClose}>
          Save
        </Button>
      </div>
    </OverlaySheet>
  )
}

function AccordionSection({
  children,
  id,
  onOpen,
  open,
  title,
}: {
  children: ReactNode
  id: SettingsSection
  onOpen: (id: SettingsSection) => void
  open: boolean
  title: string
}) {
  return (
    <details className="border-b border-neutral" open={open}>
      <summary
        className={twMerge(
          'flex h-16 w-full cursor-pointer list-none items-center justify-start gap-1 px-4 text-neutral-subtle outline-none hover:text-neutral [&::-webkit-details-marker]:hidden',
          open && 'text-neutral'
        )}
        onClick={(event) => {
          event.preventDefault()
          onOpen(id)
        }}
      >
        <span className="text-sm font-medium leading-5">{title}</span>
        <Icon
          iconName="caret-right"
          iconStyle="solid"
          className={twMerge(
            'text-xs transition-transform duration-200 motion-reduce:transition-none',
            open && 'rotate-90'
          )}
        />
      </summary>
      <div className="-mt-4 flex flex-col gap-3 px-4 pb-5">{children}</div>
    </details>
  )
}

function InformationSettings() {
  const { organizationId = '', projectId: routeProjectId = '' } = useParams({ strict: false })
  const { form } = useAgenticWorkflowCreateContext()
  const { data: projects = [], isLoading: isLoadingProjects } = useProjects({
    organizationId,
    enabled: Boolean(organizationId),
  })
  const { data: clusters = [], isLoading: isLoadingClusters } = useClusters({
    organizationId,
    enabled: Boolean(organizationId),
  })
  const storedProjectId = form.watch('projectId')
  const storedClusterId = form.watch('clusterId')
  const environmentContexts = form.watch('environmentContexts')
  const lockedClusterId = environmentContexts[0]?.clusterId
  const availableClusters = lockedClusterId ? clusters.filter((cluster) => cluster.id === lockedClusterId) : clusters
  const fallbackProjectId = projects.some((project) => project.id === routeProjectId)
    ? routeProjectId
    : projects[0]?.id ?? ''
  const fallbackClusterId =
    lockedClusterId ?? availableClusters.find((cluster) => cluster.is_default)?.id ?? availableClusters[0]?.id ?? ''
  const selectedProjectId = projects.some((project) => project.id === storedProjectId)
    ? storedProjectId
    : fallbackProjectId
  const selectedClusterId = availableClusters.some((cluster) => cluster.id === storedClusterId)
    ? storedClusterId
    : fallbackClusterId
  const projectOptions = projects.length
    ? projects.map((project) => ({ label: project.name, value: project.id }))
    : [{ label: isLoadingProjects ? 'Loading projects…' : 'No project available', value: '' }]
  const clusterOptions = availableClusters.length
    ? availableClusters.map((cluster) => ({ label: cluster.name, value: cluster.id }))
    : [{ label: isLoadingClusters ? 'Loading clusters…' : 'No cluster available', value: '' }]

  useEffect(() => {
    if (selectedProjectId && storedProjectId !== selectedProjectId) {
      form.setValue('projectId', selectedProjectId)
    }
    if (selectedClusterId && storedClusterId !== selectedClusterId) {
      form.setValue('clusterId', selectedClusterId)
    }
  }, [form, selectedClusterId, selectedProjectId, storedClusterId, storedProjectId])

  return (
    <>
      <p className="text-sm leading-5 text-neutral-subtle">
        Choose the cluster and project where your agent and its sessions run
      </p>
      <SelectField
        disabled={isLoadingProjects || projects.length === 0}
        label="Project"
        options={projectOptions}
        value={selectedProjectId}
        onChange={(projectId) => form.setValue('projectId', projectId, { shouldDirty: true })}
      />
      <SelectField
        disabled={Boolean(lockedClusterId) || isLoadingClusters || availableClusters.length === 0}
        label="Cluster"
        options={clusterOptions}
        value={selectedClusterId}
        onChange={(clusterId) => form.setValue('clusterId', clusterId, { shouldDirty: true })}
      />
    </>
  )
}

function ResourceSettings() {
  const { form } = useAgenticWorkflowCreateContext()
  const cpu = form.watch('cpu')
  const memory = form.watch('memory')

  return (
    <>
      <p className="text-sm leading-5 text-neutral-subtle">Set the maximum resources assigned to each agent session</p>
      <TextField
        label="vCPU (milli)"
        value={cpu}
        onChange={(event) => form.setValue('cpu', event.currentTarget.value, { shouldDirty: true })}
      />
      <TextField
        label="Memory (MiB)"
        value={memory}
        onChange={(event) => form.setValue('memory', event.currentTarget.value, { shouldDirty: true })}
      />
    </>
  )
}

function mapModalDataToEnvironmentVariable(
  data: CreateUpdateVariableModalSubmitData,
  current?: VariableData
): VariableData {
  return {
    variable: data.key,
    value: data.value ?? '',
    scope: data.scope,
    isSecret: data.isSecret,
    isReadOnly: current?.isReadOnly,
    description: data.description?.trim() ? data.description : undefined,
  }
}

function mapEnvironmentVariableToModalVariable(variable: VariableData, index: number): VariableResponse {
  return {
    id: `local-agent-variable-${index}`,
    key: variable.variable ?? '',
    value: variable.value ?? '',
    description: variable.description ?? '',
    is_secret: variable.isSecret,
    scope: variable.scope ?? 'ENVIRONMENT',
    variable_type: APIVariableTypeEnum.VALUE,
  } as VariableResponse
}

function EnvironmentSettings() {
  const { projectId = '', environmentId = '' } = useParams({ strict: false })
  const { form } = useAgenticWorkflowCreateContext()
  const { openModal, closeModal } = useModal()
  const variables = form.watch('environmentVariables')

  const openVariableModal = ({ defaultIsSecret, index }: { defaultIsSecret: boolean; index?: number }) => {
    const currentVariable = typeof index === 'number' ? variables[index] : undefined

    openModal({
      content: (
        <VariableFormModal
          closeModal={closeModal}
          mode={typeof index === 'number' ? 'UPDATE' : 'CREATE'}
          type={APIVariableTypeEnum.VALUE}
          variable={
            typeof index === 'number' && currentVariable
              ? mapEnvironmentVariableToModalVariable(currentVariable, index)
              : undefined
          }
          defaultIsSecret={defaultIsSecret}
          onSubmit={(data) => {
            const nextVariable = mapModalDataToEnvironmentVariable(data, currentVariable)
            const nextVariables =
              typeof index === 'number'
                ? variables.map((variable, variableIndex) => (variableIndex === index ? nextVariable : variable))
                : [...variables, nextVariable]

            form.setValue('environmentVariables', nextVariables, { shouldDirty: true })
          }}
          scope="ENVIRONMENT"
          projectId={projectId}
          environmentId={environmentId}
        />
      ),
      options: {
        fakeModal: true,
      },
    })
  }

  return (
    <>
      <p className="text-sm leading-5 text-neutral-subtle">
        Add variables or secrets that the agent and its sessions will consume at runtime
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="solid"
          color="neutral"
          size="sm"
          onClick={() => openVariableModal({ defaultIsSecret: false })}
        >
          <Icon iconName="key" />
          Add variable
        </Button>
        <Button
          type="button"
          variant="outline"
          color="neutral"
          size="sm"
          onClick={() => openVariableModal({ defaultIsSecret: true })}
        >
          <Icon iconName="lock-keyhole" />
          Add secret
        </Button>
      </div>
      {variables.map((variable, index) => (
        <div
          key={`${variable.scope}-${variable.variable}-${index}`}
          className="flex items-center gap-2 rounded-md border border-neutral p-3"
        >
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 truncate text-sm font-medium text-neutral">
              {variable.isSecret ? <Icon iconName="lock-keyhole" className="text-xs text-neutral-subtle" /> : null}
              {variable.variable}
            </p>
            <p className="truncate text-sm text-neutral-subtle">
              {variable.isSecret ? '••••••••••••' : variable.value || 'Value'}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            color="neutral"
            size="xs"
            iconOnly
            aria-label={`Edit ${variable.isSecret ? 'secret' : 'variable'}`}
            onClick={() => openVariableModal({ defaultIsSecret: variable.isSecret, index })}
          >
            <Icon iconName="pen" />
          </Button>
          <Button
            type="button"
            variant="outline"
            color="neutral"
            size="xs"
            iconOnly
            aria-label={`Delete ${variable.isSecret ? 'secret' : 'variable'}`}
            onClick={() =>
              form.setValue(
                'environmentVariables',
                variables.filter((_, variableIndex) => variableIndex !== index),
                { shouldDirty: true }
              )
            }
          >
            <Icon iconName="trash-can" />
          </Button>
        </div>
      ))}
    </>
  )
}

function NetworkSettings() {
  const { form } = useAgenticWorkflowCreateContext()
  const whitelistHosts = form.watch('whitelistHosts')
  const [mode, setMode] = useState<'deny' | 'whitelist'>('deny')

  return (
    <>
      <p className="text-sm leading-5 text-neutral-subtle">
        Your agent can always reach the services it&apos;s configured with (model provider, MCP servers, repo)
      </p>
      <p className="text-sm font-medium text-neutral-subtle">Always allowed</p>
      <div className="flex flex-wrap gap-2">
        {['api.openai.com', 'mcp.qovery.com', 'api.github.com'].map((host) => (
          <span
            key={host}
            className="inline-flex h-6 items-center gap-1 rounded-full border border-neutral bg-surface-neutral-component px-2 text-xs text-neutral"
          >
            <Icon iconName="link" />
            {host}
          </span>
        ))}
      </div>
      <p className="text-sm font-medium text-neutral-subtle">Additional access</p>
      <SegmentedControl.Root
        className="w-full"
        value={mode}
        onValueChange={(value) => setMode(value as 'deny' | 'whitelist')}
      >
        <SegmentedControl.Item value="deny" icon={<Icon iconName="ban" />}>
          Deny all
        </SegmentedControl.Item>
        <SegmentedControl.Item value="whitelist" icon={<Icon iconName="list-check" />}>
          Whitelist
        </SegmentedControl.Item>
      </SegmentedControl.Root>
      {mode === 'whitelist' ? (
        <Field label="Authorized domains" hint="Add domain names, separated by commas">
          <textarea
            rows={3}
            placeholder="api.example.com, api.other.com"
            className="resize-none rounded-md border border-neutral bg-surface-neutral-component p-3 text-sm text-neutral outline-none placeholder:text-neutral-disabled focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-strong"
            value={whitelistHosts}
            onChange={(event) => form.setValue('whitelistHosts', event.currentTarget.value, { shouldDirty: true })}
          />
        </Field>
      ) : null}
    </>
  )
}

function CostSettings() {
  return (
    <>
      <p className="text-sm leading-5 text-neutral-subtle">
        Set spending and runtime limits for this agent&apos;s sessions
      </p>
      <SelectField label="Idle auto-stop" options={['3 hours']} value="3 hours" onChange={() => undefined} />
      <SelectField label="Max session duration" options={['24 hours']} value="24 hours" onChange={() => undefined} />
      <TextField label="Max concurrency per user" value="5" readOnly />
      <div className="grid grid-cols-[1fr_104px] items-end gap-2">
        <TextField label="Max token consumption per period" value="1,000,000" readOnly />
        <SelectField label=" " options={['per week']} value="per week" onChange={() => undefined} />
      </div>
    </>
  )
}

function AccessSettings() {
  const { organizationId = '' } = useParams({ strict: false })
  const { data: organization } = useOrganization({ organizationId, enabled: Boolean(organizationId) })
  const { data: user } = useUserAccount()
  const [access, setAccess] = useState<'invited' | 'everyone'>('everyone')
  const [organizationPermission, setOrganizationPermission] = useState<'chat' | 'edit'>('chat')
  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'You'
  const userInitials = displayName
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-5 text-neutral-subtle">
        Choose which team members can access this agent, and what they can do.
      </p>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium leading-5 text-neutral-subtle">Who have access</p>
        <div className="flex h-6 items-center gap-2">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button type="button" variant="plain" color="neutral" size="xs" className="gap-1.5 px-0 text-sm">
                <Icon iconName={access === 'everyone' ? 'globe' : 'user-group'} className="text-sm" />
                {access === 'everyone' ? 'Everyone' : 'Only invited people'}
                <Icon iconName="angle-down" className="text-ssm" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className="z-dropdown w-48">
              <DropdownMenu.Item icon={<Icon iconName="user-group" />} onSelect={() => setAccess('invited')}>
                Only invited people
              </DropdownMenu.Item>
              <DropdownMenu.Item icon={<Icon iconName="globe" />} onSelect={() => setAccess('everyone')}>
                Everyone
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          {access === 'invited' ? (
            <Button type="button" variant="solid" color="neutral" size="xs" className="ml-auto">
              Invite
            </Button>
          ) : null}
        </div>
        <div className="flex h-6 items-center gap-1.5">
          <Avatar
            src={user?.profile_picture_url ?? undefined}
            alt={displayName}
            fallback={<span className="text-2xs font-medium text-neutral">{userInitials}</span>}
            size="xs"
            radius="full"
            className="bg-surface-neutral-component"
          />
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral">{displayName} (you)</span>
          <span className="text-ssm text-neutral-subtle">Owner</span>
        </div>
        {access === 'everyone' ? (
          <div className="flex h-6 items-center gap-1.5">
            <Avatar
              src={organization?.logo_url ?? undefined}
              alt={organization?.name}
              fallback={<span className="text-2xs font-medium text-neutral">{organization?.name?.charAt(0)}</span>}
              size="xs"
              radius="full"
              className="bg-surface-neutral-component"
            />
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral">
              Anyone in {organization?.name || 'your organization'}
            </span>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button type="button" variant="plain" color="neutral" size="xs" className="text-neutral-subtle">
                  {organizationPermission === 'chat' ? 'Can chat' : 'Can edit'}
                  <Icon iconName="angle-down" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end" className="z-dropdown w-36">
                <DropdownMenu.Item onSelect={() => setOrganizationPermission('chat')}>Can chat</DropdownMenu.Item>
                <DropdownMenu.Item onSelect={() => setOrganizationPermission('edit')}>Can edit</DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function DockerSettings({ onAddRaw }: { onAddRaw: () => void }) {
  const { form } = useAgenticWorkflowCreateContext()
  const dockerFragment = form.watch('dockerFragment')

  return (
    <>
      <p className="text-sm leading-5 text-neutral-subtle">
        Customize your agent&apos;s environment with advanced setup and tooling
      </p>
      {dockerFragment ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-subtle">Added fragment</span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                color="neutral"
                size="xs"
                iconOnly
                aria-label="Edit Dockerfile fragment"
                onClick={onAddRaw}
              >
                <Icon iconName="pen" />
              </Button>
              <Button
                type="button"
                variant="outline"
                color="neutral"
                size="xs"
                iconOnly
                aria-label="Delete Dockerfile fragment"
                onClick={() => form.setValue('dockerFragment', '', { shouldDirty: true })}
              >
                <Icon iconName="trash-can" />
              </Button>
            </div>
          </div>
          <div className="rounded-lg border border-neutral bg-surface-neutral p-3">
            <code className="line-clamp-3 whitespace-pre-wrap font-code text-xs leading-5 text-neutral">
              {dockerFragment}
            </code>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button type="button" variant="outline" color="neutral" size="sm">
            <Icon iconName="file-arrow-up" />
            Add file
          </Button>
          <Button type="button" variant="outline" color="neutral" size="sm" onClick={onAddRaw}>
            <Icon iconName="code" />
            Add raw
          </Button>
        </div>
      )}
    </>
  )
}

function SettingsRail({ onAddDockerRaw }: { onAddDockerRaw: () => void }) {
  const [openSections, setOpenSections] = useState<SettingsSection[]>(['information'])
  const toggleSection = (section: SettingsSection) => {
    setOpenSections((currentSections) =>
      currentSections.includes(section)
        ? currentSections.filter((currentSection) => currentSection !== section)
        : [...currentSections, section]
    )
  }

  return (
    <aside className="h-full w-[371px] shrink-0 overflow-auto border-l border-neutral bg-background-secondary">
      <AccordionSection
        id="information"
        title="Informations"
        open={openSections.includes('information')}
        onOpen={toggleSection}
      >
        <InformationSettings />
      </AccordionSection>
      <AccordionSection
        id="resources"
        title="Resources"
        open={openSections.includes('resources')}
        onOpen={toggleSection}
      >
        <ResourceSettings />
      </AccordionSection>
      <AccordionSection
        id="environment"
        title="Environment variables"
        open={openSections.includes('environment')}
        onOpen={toggleSection}
      >
        <EnvironmentSettings />
      </AccordionSection>
      <AccordionSection
        id="network"
        title="Network control"
        open={openSections.includes('network')}
        onOpen={toggleSection}
      >
        <NetworkSettings />
      </AccordionSection>
      <AccordionSection id="cost" title="Cost control" open={openSections.includes('cost')} onOpen={toggleSection}>
        <CostSettings />
      </AccordionSection>
      <AccordionSection id="access" title="Access" open={openSections.includes('access')} onOpen={toggleSection}>
        <AccessSettings />
      </AccordionSection>
      <AccordionSection
        id="docker"
        title="Dockerfile fragment"
        open={openSections.includes('docker')}
        onOpen={toggleSection}
      >
        <DockerSettings onAddRaw={onAddDockerRaw} />
      </AccordionSection>
    </aside>
  )
}

function DockerFragmentModal({ setOpen }: { setOpen?: (open: boolean) => void }) {
  const { form } = useAgenticWorkflowCreateContext()
  const dockerFragment = form.watch('dockerFragment')
  const [value, setValue] = useState(dockerFragment)

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex flex-col gap-1 pr-8">
        <h2 className="text-xl font-medium leading-7 text-neutral">
          {dockerFragment ? 'Edit Dockerfile fragment' : 'Add Dockerfile fragment'}
        </h2>
        <p className="text-sm leading-5 text-neutral-subtle">Add setup commands that run before the agent starts.</p>
      </div>
      <div className="overflow-hidden rounded-md border border-neutral">
        <CodeEditor
          height="320px"
          language="dockerfile"
          value={value}
          onChange={(nextValue) => setValue(nextValue ?? '')}
          options={{ scrollBeyondLastLine: false, wordWrap: 'on' }}
        />
      </div>
      <Button
        type="button"
        size="lg"
        className="w-fit"
        onClick={() => {
          form.setValue('dockerFragment', value, { shouldDirty: true })
          setOpen?.(false)
        }}
      >
        Save fragment
      </Button>
    </div>
  )
}

export function AgenticWorkflowConfiguration() {
  const navigate = useNavigate()
  const { creationFlowUrl, form, onExit, setCurrentStep } = useAgenticWorkflowCreateContext()
  const [activeSheet, setActiveSheet] = useState<SheetView>(null)
  const [providerModalOpen, setProviderModalOpen] = useState(false)
  const [mcpModalOpen, setMcpModalOpen] = useState(false)
  const [dockerModalOpen, setDockerModalOpen] = useState(false)
  const { openModal, closeModal } = useModal()
  const values = form.watch()
  const contextCount = values.environmentContexts.length + values.gitRepositories.length
  const linkedMcpServers = useMemo(
    () => values.orgMcpServers.filter((server) => values.linkedMcpServerIds.includes(server.id)),
    [values.linkedMcpServerIds, values.orgMcpServers]
  )

  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  const saveProvider = (provider: AgenticWorkflowProvider) => {
    form.setValue('provider', provider, { shouldDirty: true })
    form.setValue('modelApiKey', provider.apiKey, { shouldDirty: true })
  }

  const openEnvironmentContext = (contextId?: string) => {
    const editingContext = values.environmentContexts.find(({ id }) => id === contextId)
    const lockedClusterId = values.environmentContexts.find(({ id }) => id !== contextId)?.clusterId

    openModal({
      content: (
        <EnvironmentContextModal
          context={editingContext}
          lockedClusterId={lockedClusterId}
          setOpen={(open) => {
            if (!open) closeModal()
          }}
          onRemove={
            editingContext
              ? () => {
                  form.setValue(
                    'environmentContexts',
                    values.environmentContexts.filter(({ id }) => id !== editingContext.id),
                    { shouldDirty: true }
                  )
                  closeModal()
                }
              : undefined
          }
          onSave={(context) => {
            form.setValue(
              'environmentContexts',
              editingContext
                ? values.environmentContexts.map((current) => (current.id === context.id ? context : current))
                : [...values.environmentContexts, context],
              { shouldDirty: true }
            )
            form.setValue('clusterId', context.clusterId, { shouldDirty: true })
          }}
        />
      ),
      options: {
        width: 488,
        fakeModal: true,
        preventAutoFocus: true,
      },
    })
  }

  const openGitContext = (index?: number) => {
    const editingContext = typeof index === 'number' ? values.gitRepositories[index] : undefined

    openModal({
      content: (
        <GitContextModal
          context={editingContext}
          setOpen={(open) => {
            if (!open) closeModal()
          }}
          onRemove={
            typeof index === 'number'
              ? () => {
                  form.setValue(
                    'gitRepositories',
                    values.gitRepositories.filter((_, repositoryIndex) => repositoryIndex !== index),
                    { shouldDirty: true }
                  )
                  closeModal()
                }
              : undefined
          }
          onSave={(context) =>
            form.setValue(
              'gitRepositories',
              typeof index === 'number'
                ? values.gitRepositories.map((current, repositoryIndex) =>
                    repositoryIndex === index ? context : current
                  )
                : [...values.gitRepositories, context],
              { shouldDirty: true }
            )
          }
        />
      ),
      options: {
        width: 488,
        fakeModal: true,
      },
    })
  }

  return (
    <div className="absolute inset-0 z-10 flex min-h-[640px] min-w-[960px] overflow-hidden bg-background">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between px-6 py-4">
          <Button type="button" variant="plain" color="neutral" size="xs" iconOnly aria-label="Back" onClick={onExit}>
            <Icon iconName="arrow-left" />
          </Button>
          <Button
            type="button"
            variant="outline"
            color="neutral"
            size="sm"
            onClick={() => navigate({ to: `${creationFlowUrl}/summary` })}
          >
            Save as draft
          </Button>
        </header>

        <main className="flex-1 overflow-auto border-b border-neutral px-20 py-10">
          <div className="flex max-w-[920px] flex-col">
            <div className="flex flex-col items-start gap-3">
              <Button
                type="button"
                variant="outline"
                color="neutral"
                className="h-12 w-12 px-0 text-sm text-neutral-disabled"
                aria-label="Choose agent icon"
              >
                ICON
              </Button>
              <InlineTitle
                value={values.name}
                onChange={(name) => form.setValue('name', name, { shouldDirty: true })}
              />
            </div>

            <section className="flex flex-col gap-2 py-6">
              <h2 className="text-sm font-medium text-neutral-subtle">Context</h2>
              {contextCount === 0 ? (
                <div className="flex flex-wrap gap-3">
                  <ContextCard
                    icon={<Icon name={IconEnum.QOVERY} className="h-4 w-4" />}
                    title="Import from existing Qovery environment"
                    description="Import context from one of your real services running on Qovery"
                    onClick={() => openEnvironmentContext()}
                  />
                  <ContextCard
                    icon={<Icon iconName="github" iconStyle="brands" />}
                    title="Add from git repository"
                    description="Add a git repository to load as the agent's context."
                    onClick={() => openGitContext()}
                  />
                </div>
              ) : (
                <>
                  <ContextMenu onAddQovery={() => openEnvironmentContext()} onAddGit={() => openGitContext()} />
                  <div className="grid grid-cols-3 gap-3">
                    {values.environmentContexts.map((context) => (
                      <CompactContextCard
                        key={context.id}
                        badge="Qovery env"
                        badgeIcon={<Icon name={IconEnum.QOVERY} className="h-3 w-3" />}
                        onClick={() => openEnvironmentContext(context.id)}
                      >
                        <span className="flex items-center gap-2">
                          <EnvironmentModeBadge mode={context.environmentMode} />
                          <span className="truncate">{context.environmentName}</span>
                          <span className="truncate text-neutral-subtle">{context.projectName}</span>
                        </span>
                      </CompactContextCard>
                    ))}
                    {values.gitRepositories.map((repository, index) => (
                      <CompactContextCard
                        key={`${repository.repository}-${index}`}
                        badge="GitHub"
                        badgeClassName="pl-0.5 pr-1.5"
                        badgeIcon={<Icon iconName="github" iconStyle="brands" className="text-xs" />}
                        onClick={() => openGitContext(index)}
                      >
                        {repository.repository}
                      </CompactContextCard>
                    ))}
                  </div>
                </>
              )}
            </section>

            <section className="border-t border-neutral py-3">
              <AgentSettingRow label="Provider">
                {values.provider ? (
                  <>
                    <LinkedBadge
                      icon={
                        values.provider.id === 'openai' ? (
                          <Icon iconName="openai" iconStyle="brands" />
                        ) : (
                          <Icon iconName="claude" iconStyle="brands" />
                        )
                      }
                      onClick={() => setActiveSheet('provider')}
                    >
                      {values.provider.name}
                    </LinkedBadge>
                    <AddRowButton onClick={() => setProviderModalOpen(true)}>Add provider</AddRowButton>
                  </>
                ) : (
                  <AddRowButton onClick={() => setProviderModalOpen(true)}>Add provider</AddRowButton>
                )}
              </AgentSettingRow>
              <AgentSettingRow label="MCP">
                {linkedMcpServers.map((server) => (
                  <LinkedBadge
                    key={server.id}
                    icon={<McpIcon name={server.name} />}
                    onClick={() => setActiveSheet('mcp')}
                  >
                    {server.name}
                  </LinkedBadge>
                ))}
                <AddRowButton onClick={() => setActiveSheet('mcp')}>Add MCP</AddRowButton>
              </AgentSettingRow>
              <AgentSettingRow label="Skills">
                {values.skills.map((skill) => (
                  <LinkedBadge
                    key={skill.id}
                    icon={<Icon iconName="wand-magic-sparkles" />}
                    onClick={() => setActiveSheet('skills')}
                  >
                    {skill.name}
                  </LinkedBadge>
                ))}
                <AddRowButton onClick={() => setActiveSheet('skills')}>Add skill</AddRowButton>
              </AgentSettingRow>
              <AgentSettingRow label="Automations">
                <AddRowButton onClick={() => undefined}>Add automations</AddRowButton>
              </AgentSettingRow>
            </section>

            <section className="flex flex-col gap-2 border-t border-neutral pt-6">
              <h2 className="text-sm font-medium text-neutral-subtle">Instructions</h2>
              <InstructionsEditor
                value={values.agentPrompt}
                onChange={(agentPrompt) => form.setValue('agentPrompt', agentPrompt, { shouldDirty: true })}
              />
            </section>
          </div>
        </main>
      </div>

      <SettingsRail onAddDockerRaw={() => setDockerModalOpen(true)} />

      {activeSheet === 'provider' ? <ProviderSheet onClose={() => setActiveSheet(null)} /> : null}
      {activeSheet === 'mcp' ? (
        <McpSheet onAddMcp={() => setMcpModalOpen(true)} onClose={() => setActiveSheet(null)} />
      ) : null}
      {activeSheet === 'skills' ? <SkillsSheet onClose={() => setActiveSheet(null)} /> : null}

      {providerModalOpen ? (
        <Modal
          externalOpen={providerModalOpen}
          setExternalOpen={setProviderModalOpen}
          width={488}
          className="rounded-lg"
        >
          <ProviderModal provider={values.provider} onSave={saveProvider} />
        </Modal>
      ) : null}
      {mcpModalOpen ? (
        <Modal externalOpen={mcpModalOpen} setExternalOpen={setMcpModalOpen} width={488} className="rounded-lg">
          <McpServerModal />
        </Modal>
      ) : null}
      {dockerModalOpen ? (
        <Modal externalOpen={dockerModalOpen} setExternalOpen={setDockerModalOpen} width={720} className="rounded-lg">
          <DockerFragmentModal />
        </Modal>
      ) : null}
    </div>
  )
}
