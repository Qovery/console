import * as Dialog from '@radix-ui/react-dialog'
import { useNavigate, useParams } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { APIVariableScopeEnum, type McpServerResponse } from 'qovery-typescript-axios'
import { type ReactNode, useRef, useState } from 'react'
import { FormProvider, useFieldArray } from 'react-hook-form'
import { McpServerCreateEditModal, useMcpServers } from '@qovery/domains/organizations/feature'
import { VariableRow, useImportVariables } from '@qovery/domains/variables/feature'
import { type VariableData } from '@qovery/shared/interfaces'
import {
  Accordion,
  Button,
  CodeEditor,
  ExternalLink,
  Heading,
  Icon,
  InputSearch,
  InputText,
  InputTextArea,
  InputToggle,
  Modal,
  Section,
  Sheet,
  useModal,
} from '@qovery/shared/ui'
import { prepareVariableImportRequest } from '@qovery/shared/util-js'
import { useCreateService } from '../../../hooks/use-create-service/use-create-service'
import { useDeployEnvironment } from '../../../hooks/use-deploy-environment/use-deploy-environment'
import { ServiceAvatar } from '../../../service-avatar/service-avatar'
import {
  type AgenticWorkflowGitRepository,
  type AgenticWorkflowOutput,
  useAgenticWorkflowCreateContext,
} from '../agentic-workflow-context'
import { formatAgenticWorkflowRequest } from '../agentic-workflow-request'
import { AgenticWorkflowScheduleFields, isAgenticWorkflowScheduleValid } from '../agentic-workflow-schedule-fields'
import { AgenticWorkflowPromptEditor, type AgenticWorkflowPromptEditorHandle } from './agentic-workflow-prompt-editor'
import { AIModelCards } from './ai-model-cards'
import { GitRepositoryCard } from './git-repository-card'

type SettingsGroup = 'general' | 'resources' | 'variables' | 'outputs' | 'advanced'

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

export function areVariablesValid(variables: VariableData[]) {
  return variables.every(
    ({ variable, value, scope }) =>
      Boolean(variable?.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) && Boolean(value) && Boolean(scope)
  )
}

function SettingsAccordionItem({
  children,
  invalid,
  summary,
  title,
  value,
}: {
  children: ReactNode
  invalid: boolean
  summary?: string
  title: string
  value: SettingsGroup
}) {
  return (
    <Accordion.Item value={value} className="border-b border-neutral last:rounded-b-none">
      <Accordion.Trigger
        data-settings-group={value}
        className="w-full cursor-pointer justify-between gap-3 bg-background-secondary px-4 py-4 text-left focus-visible:bg-surface-neutral-subtle focus-visible:outline-none"
        iconClassName="order-2 ml-auto"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex items-center gap-2 font-medium text-neutral">
            {title}
            {invalid ? <Icon iconName="circle-xmark" className="text-xs text-negative" /> : null}
          </span>
          {summary ? <span className="ml-auto truncate text-xs font-normal text-neutral-subtle">{summary}</span> : null}
        </div>
      </Accordion.Trigger>
      <Accordion.Content className="bg-background-secondary">
        <div className="flex flex-col gap-4 px-4 pb-5">{children}</div>
      </Accordion.Content>
    </Accordion.Item>
  )
}

function ConfigurationModalContent({
  children,
  description,
  doneDisabled = false,
  setOpen,
  title,
}: {
  children: ReactNode
  description: ReactNode
  doneDisabled?: boolean
  setOpen?: (open: boolean) => void
  title: string
}) {
  return (
    <div className="flex flex-col">
      <div className="border-b border-neutral px-5 py-4 pr-12">
        <Heading level={2}>{title}</Heading>
        <p className="mt-1 text-sm text-neutral-subtle">{description}</p>
      </div>
      <div className="flex flex-col gap-4 p-5">{children}</div>
      <div className="flex justify-end border-t border-neutral p-5">
        <Button type="button" size="md" disabled={doneDisabled} onClick={() => setOpen?.(false)}>
          Done
        </Button>
      </div>
    </div>
  )
}

function ConfigurationRow({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="grid min-h-11 grid-cols-1 items-center gap-1 sm:grid-cols-[112px_minmax(0,1fr)] sm:gap-4">
      <span className="text-sm font-medium text-neutral-subtle">{label}</span>
      <div className="group flex min-h-9 min-w-0 flex-wrap items-center gap-2 rounded px-1 hover:bg-surface-neutral-subtle">
        {children}
      </div>
    </div>
  )
}

function McpServerPicker({
  createdMcpServers,
  isLoading,
  mcpServers,
  onChange,
  onMcpServerCreated,
  value,
}: {
  createdMcpServers: McpServerResponse[]
  isLoading: boolean
  mcpServers: McpServerResponse[]
  onChange: (value: string[]) => void
  onMcpServerCreated: (mcpServer: McpServerResponse) => void
  value: string[]
}) {
  const { closeModal, openModal } = useModal()
  const [search, setSearch] = useState('')
  const availableMcpServers = [...mcpServers, ...createdMcpServers].filter(
    (mcpServer, index, servers) => servers.findIndex(({ id }) => id === mcpServer.id) === index
  )
  const matchingMcpServers = availableMcpServers.filter(({ name, url }) =>
    `${name} ${url}`.toLowerCase().includes(search.trim().toLowerCase())
  )
  const connectedMcpServers = matchingMcpServers.filter(({ id }) => value.includes(id))
  const disconnectedMcpServers = matchingMcpServers.filter(({ id }) => !value.includes(id))

  const createMcpServer = () => {
    openModal({
      content: (
        <McpServerCreateEditModal
          onClose={(mcpServer) => {
            if (mcpServer) {
              onMcpServerCreated(mcpServer)
              onChange([...new Set([...value, mcpServer.id])])
            }
            closeModal()
          }}
        />
      ),
      options: { fakeModal: true, width: 680 },
    })
  }

  const mcpServerRow = (mcpServer: McpServerResponse, connected: boolean) => (
    <button
      key={mcpServer.id}
      type="button"
      className="flex min-h-10 w-full items-center gap-3 rounded px-2 text-left hover:bg-surface-neutral-subtle focus-visible:outline-2 focus-visible:outline-neutral-strong"
      aria-label={connected ? `Remove ${mcpServer.name}` : `Add ${mcpServer.name}`}
      onClick={() =>
        onChange(connected ? value.filter((mcpServerId) => mcpServerId !== mcpServer.id) : [...value, mcpServer.id])
      }
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-neutral bg-surface-neutral">
        <Icon iconName="plug" iconStyle="regular" className="text-neutral-subtle" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-neutral">{mcpServer.name}</p>
        <p className="truncate text-xs text-neutral-subtle">{mcpServer.url}</p>
      </div>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center">
        <Icon iconName={connected ? 'circle-check' : 'plus'} className={connected ? 'text-positive' : undefined} />
      </span>
    </button>
  )

  return (
    <div className="flex flex-col gap-5">
      <InputSearch placeholder="Search MCP" autofocus onChange={setSearch} />
      {connectedMcpServers.length > 0 ? (
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-2">
            <Heading level={3} weight="medium">
              Connected ({connectedMcpServers.length})
            </Heading>
            <Button type="button" size="sm" color="neutral" variant="plain" onClick={() => onChange([])}>
              Remove all
            </Button>
          </div>
          <div>{connectedMcpServers.map((mcpServer) => mcpServerRow(mcpServer, true))}</div>
        </section>
      ) : null}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-2">
          <Heading level={3} weight="medium">
            Available MCPs
          </Heading>
          <Button type="button" size="sm" color="neutral" variant="outline" onClick={createMcpServer}>
            <Icon iconName="circle-plus" iconStyle="regular" />
            New MCP
          </Button>
        </div>
        {isLoading ? (
          <p className="px-2 text-sm text-neutral-subtle">Loading MCPs...</p>
        ) : disconnectedMcpServers.length > 0 ? (
          <div>{disconnectedMcpServers.map((mcpServer) => mcpServerRow(mcpServer, false))}</div>
        ) : search.trim() ? (
          <p className="px-2 text-sm text-neutral-subtle">No MCP matches this search.</p>
        ) : null}
      </section>
    </div>
  )
}

export function AgenticWorkflowCodeEditorField({
  error,
  height = '180px',
  hideLabel = false,
  hint,
  label,
  language,
  name,
  onChange,
  placeholder,
  value,
}: {
  error?: string
  height?: string
  hideLabel?: boolean
  hint?: ReactNode
  label: string
  language: string
  name: string
  onChange: (value: string) => void
  placeholder?: string
  value: string
}) {
  return (
    <div data-testid={`code-editor-field-${name}`} className="flex flex-col gap-1">
      <label className={hideLabel ? 'sr-only' : 'px-3 text-xs font-medium text-neutral'} htmlFor={name}>
        {label}
      </label>
      <div
        id={name}
        className={`relative overflow-hidden rounded border bg-surface-neutral ${
          error ? 'border-negative' : 'border-neutral'
        }`}
      >
        {placeholder && !value.trim() && (
          <div className="pointer-events-none absolute left-[62px] top-[7px] z-10 max-w-[calc(100%-76px)] text-xs leading-5 text-neutral-subtle">
            {placeholder}
          </div>
        )}
        <CodeEditor
          height={height}
          language={language}
          value={value}
          onChange={(nextValue) => onChange(nextValue ?? '')}
          options={{
            scrollbar: { alwaysConsumeMouseWheel: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
          }}
        />
      </div>
      {hint && !error && <div className="px-3 text-xs font-normal text-neutral-subtle">{hint}</div>}
      {error && <p className="px-3 text-xs font-medium text-negative">{error}</p>}
    </div>
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
  const { environmentId = '', organizationId = '', projectId = '' } = useParams({ strict: false })
  const { data: mcpServers = [], isLoading: areMcpServersLoading } = useMcpServers({ organizationId })
  const navigate = useNavigate()
  const { form, onExit, variablesForm } = useAgenticWorkflowCreateContext()
  const { isLoading: isCreating, mutateAsync: createService } = useCreateService({ organizationId })
  const { isLoading: isDeploying, mutateAsync: deployEnvironment } = useDeployEnvironment({ projectId })
  const { isLoading: isImportingVariables, mutateAsync: importVariables } = useImportVariables()
  const {
    fields: variables,
    append: appendVariable,
    remove: removeVariable,
  } = useFieldArray({
    control: variablesForm.control,
    name: 'variables',
  })
  const [openSettingsGroups, setOpenSettingsGroups] = useState<SettingsGroup[]>(['general'])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [contextModalOpen, setContextModalOpen] = useState(false)
  const [providerModalOpen, setProviderModalOpen] = useState(false)
  const [mcpModalOpen, setMcpModalOpen] = useState(false)
  const [createdMcpServers, setCreatedMcpServers] = useState<McpServerResponse[]>([])
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [dockerModalOpen, setDockerModalOpen] = useState(false)
  const [showValidationErrors, setShowValidationErrors] = useState(false)
  const modelApiKeyInputRef = useRef<HTMLInputElement>(null)
  const promptEditorRef = useRef<AgenticWorkflowPromptEditorHandle>(null)
  const createdServiceIdRef = useRef<string>()
  const values = form.watch()
  const { dirtyFields } = form.formState
  const mcpJsonError = getJsonError(values.mcpJson)
  const outputHeadersErrors = values.outputs.map((output) => getJsonError(output.headersJson))
  const modelSettingsJsonError = getJsonError(values.modelSettingsJson, true)
  const gitRepositoriesValid = values.gitRepositories.every(isGitRepositoryComplete)
  const outputsValid = values.outputs.every(isOutputComplete)
  const variableValues = variablesForm.watch('variables')
  const variablesValid = areVariablesValid(variableValues)
  const showNameError = (showValidationErrors || Boolean(dirtyFields.name)) && !values.name.trim()
  const showPromptError = (showValidationErrors || Boolean(dirtyFields.agentPrompt)) && !values.agentPrompt.trim()
  const showModelApiKeyError = (showValidationErrors || Boolean(dirtyFields.modelApiKey)) && !values.modelApiKey.trim()
  const providerConfigurationInvalid = !values.modelApiKey.trim() || Boolean(modelSettingsJsonError)
  const settingsGroupsInvalid: Record<SettingsGroup, boolean> = {
    general: false,
    resources: false,
    variables: !variablesValid,
    outputs: !outputsValid || outputHeadersErrors.some(Boolean),
    advanced: Boolean(mcpJsonError),
  }
  const availableMcpServers = [...mcpServers, ...createdMcpServers].filter(
    (mcpServer, index, servers) => servers.findIndex(({ id }) => id === mcpServer.id) === index
  )
  const addRepository = () =>
    form.setValue(
      'gitRepositories',
      [
        ...values.gitRepositories,
        {
          provider: undefined,
          gitTokenId: undefined,
          gitTokenName: undefined,
          isPublicRepository: false,
          repository: '',
          gitRepository: undefined,
          branch: '',
        },
      ],
      { shouldDirty: true }
    )

  const addOutput = () =>
    form.setValue(
      'outputs',
      [
        ...values.outputs,
        {
          url: '',
          headersJson: `{
  "Authorization": "Bearer {{TOKEN}}"
}`,
          prompt: '',
        },
      ],
      {
        shouldDirty: true,
      }
    )

  const focusSettingsGroup = (group: SettingsGroup) => {
    setOpenSettingsGroups((groups) => (groups.includes(group) ? groups : [...groups, group]))
    const isDesktop = window.matchMedia?.('(min-width: 1024px)').matches ?? true
    if (!isDesktop) setSettingsOpen(true)

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const panel = isDesktop ? 'desktop' : 'mobile'
        document
          .querySelector<HTMLElement>(`[data-settings-panel="${panel}"] [data-settings-group="${group}"]`)
          ?.focus({ preventScroll: true })
      })
    })
  }

  const validateConfiguration = () => {
    setShowValidationErrors(true)

    if (!values.name.trim()) {
      promptEditorRef.current?.focusName()
      return false
    }

    if (!values.agentPrompt.trim()) {
      promptEditorRef.current?.focusPrompt()
      return false
    }

    if (providerConfigurationInvalid) {
      setProviderModalOpen(true)
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => modelApiKeyInputRef.current?.focus())
      })
      return false
    }

    if (!isAgenticWorkflowScheduleValid(values)) {
      setScheduleModalOpen(true)
      return false
    }

    if (!gitRepositoriesValid) {
      setContextModalOpen(true)
      return false
    }

    const firstInvalidGroup = (['general', 'resources', 'variables', 'outputs', 'advanced'] as const).find(
      (group) => settingsGroupsInvalid[group]
    )

    if (firstInvalidGroup) {
      focusSettingsGroup(firstInvalidGroup)
      return false
    }

    return true
  }

  const handleSubmit = async (withDeploy: boolean) => {
    if (!validateConfiguration()) return

    try {
      if (!createdServiceIdRef.current) {
        const service = await createService({
          environmentId,
          payload: {
            serviceType: 'AGENTIC_WORKFLOW',
            ...formatAgenticWorkflowRequest(form.getValues()),
          },
        })
        createdServiceIdRef.current = service.id
      }

      const variableImportRequest = prepareVariableImportRequest(variableValues)
      if (variableImportRequest) {
        await importVariables({
          serviceId: createdServiceIdRef.current,
          serviceType: 'AGENTIC_WORKFLOW',
          variableImportRequest,
        })
      }

      if (withDeploy) {
        await deployEnvironment({ environmentId })
      }

      posthog.capture('create-service', { selectedServiceType: 'agentic-workflow' })
      navigate({
        to: '/organization/$organizationId/project/$projectId/environment/$environmentId/overview',
        params: { organizationId, projectId, environmentId },
      })
    } catch {
      // Errors are surfaced by mutation notifications. Keep the created service ID so a retry does not duplicate it.
    }
  }

  const settingsContent = (panel: 'desktop' | 'mobile') => (
    <Accordion.Root
      data-settings-panel={panel}
      type="multiple"
      value={openSettingsGroups}
      onValueChange={(groups) => setOpenSettingsGroups(groups as SettingsGroup[])}
    >
      <SettingsAccordionItem
        value="general"
        title="General settings"
        invalid={showValidationErrors && settingsGroupsInvalid.general}
      >
        <InputTextArea
          name={`description-${panel}`}
          label="Description"
          value={values.description}
          onChange={(event) => form.setValue('description', event.currentTarget.value, { shouldDirty: true })}
        />
        <InputToggle
          small
          align="top"
          value={values.workflowEnabled}
          title="Enable agent task"
          description="Start listening and executing this agent task as soon as it is created."
          onChange={(value) => form.setValue('workflowEnabled', value, { shouldDirty: true })}
        />
      </SettingsAccordionItem>

      <SettingsAccordionItem value="resources" title="Resources" invalid={false}>
        <div className="grid gap-3">
          <InputText
            name={`cpu-${panel}`}
            label="CPU (mCPU)"
            type="number"
            value={values.cpu}
            onChange={(event) => form.setValue('cpu', event.currentTarget.value, { shouldDirty: true })}
          />
          <InputText
            name={`memory-${panel}`}
            label="Memory (MB)"
            type="number"
            value={values.memory}
            onChange={(event) => form.setValue('memory', event.currentTarget.value, { shouldDirty: true })}
          />
          <InputText
            name={`storage-${panel}`}
            label="Storage (GB)"
            type="number"
            value={values.storage}
            onChange={(event) => form.setValue('storage', event.currentTarget.value, { shouldDirty: true })}
          />
        </div>
      </SettingsAccordionItem>

      <SettingsAccordionItem
        value="variables"
        title="Environment variables"
        summary={variables.length > 0 ? `${variables.length} configured` : undefined}
        invalid={showValidationErrors && settingsGroupsInvalid.variables}
      >
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            color="neutral"
            size="sm"
            onClick={() =>
              appendVariable({
                variable: '',
                value: '',
                scope: APIVariableScopeEnum.AGENTIC_WORKFLOW,
                isSecret: true,
              })
            }
          >
            <Icon iconName="lock-keyhole" iconStyle="regular" />
            Add secret
          </Button>
          <Button
            type="button"
            variant="outline"
            color="neutral"
            size="sm"
            onClick={() =>
              appendVariable({
                variable: '',
                value: '',
                scope: APIVariableScopeEnum.AGENTIC_WORKFLOW,
                isSecret: false,
              })
            }
          >
            <Icon iconName="circle-plus" iconStyle="regular" />
            Add variable
          </Button>
        </div>
        <FormProvider {...variablesForm}>
          {variables.length > 0 ? (
            <div className="flex flex-col gap-3">
              {variables.map((variable, index) => (
                <VariableRow
                  key={variable.id}
                  index={index}
                  availableScopes={[APIVariableScopeEnum.AGENTIC_WORKFLOW]}
                  gridTemplateColumns="minmax(0, 1fr) minmax(0, 1fr) 36px"
                  showScope={false}
                  onDelete={removeVariable}
                />
              ))}
            </div>
          ) : null}
        </FormProvider>
      </SettingsAccordionItem>

      <SettingsAccordionItem
        value="outputs"
        title="Outputs"
        summary={values.outputs.length > 0 ? `${values.outputs.length} configured` : undefined}
        invalid={showValidationErrors && settingsGroupsInvalid.outputs}
      >
        <div className="flex">
          <Button type="button" variant="outline" color="neutral" size="sm" onClick={addOutput}>
            <Icon iconName="circle-plus" iconStyle="regular" />
            Add webhook
          </Button>
        </div>
        {values.outputs.map((output, index) => (
          <div key={index} className="rounded border border-neutral bg-surface-neutral p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral">Webhook {index + 1}</span>
              <Button
                type="button"
                variant="plain"
                color="neutral"
                size="sm"
                onClick={() =>
                  form.setValue(
                    'outputs',
                    values.outputs.filter((_, outputIndex) => outputIndex !== index),
                    { shouldDirty: true }
                  )
                }
              >
                Remove
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              <InputText
                name={`output-url-${panel}-${index}`}
                label="Webhook URL"
                value={output.url}
                error={!output.url.trim() ? 'Please enter the output webhook URL.' : undefined}
                onChange={(event) => {
                  const outputs = [...values.outputs]
                  outputs[index] = { ...output, url: event.currentTarget.value }
                  form.setValue('outputs', outputs, { shouldDirty: true })
                }}
              />
              <AgenticWorkflowCodeEditorField
                name={`output-headers-${panel}-${index}`}
                label="Request headers JSON"
                language="json"
                height="120px"
                value={output.headersJson}
                error={outputHeadersErrors[index]}
                onChange={(value) => {
                  const outputs = [...values.outputs]
                  outputs[index] = { ...output, headersJson: value }
                  form.setValue('outputs', outputs, { shouldDirty: true })
                }}
              />
              <InputTextArea
                name={`output-prompt-${panel}-${index}`}
                label="Prompt"
                value={output.prompt}
                onChange={(event) => {
                  const outputs = [...values.outputs]
                  outputs[index] = { ...output, prompt: event.currentTarget.value }
                  form.setValue('outputs', outputs, { shouldDirty: true })
                }}
              />
            </div>
          </div>
        ))}
      </SettingsAccordionItem>

      <SettingsAccordionItem
        value="advanced"
        title="Advanced settings"
        invalid={showValidationErrors && settingsGroupsInvalid.advanced}
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div>
              <Heading level={3} weight="medium">
                Dockerfile fragment
              </Heading>
              <p className="mt-1 text-xs text-neutral-subtle">
                Install additional CLIs or binaries in the agent runtime.
              </p>
            </div>
            {values.dockerFragment ? (
              <div className="flex items-center gap-3 rounded-lg border border-neutral bg-surface-neutral p-3">
                <Icon iconName="file-lines" iconStyle="regular" className="shrink-0 text-[13px] text-neutral-subtle" />
                <span className="min-w-0 flex-1 truncate text-ssm leading-[18px] text-neutral">
                  Dockerfile fragment
                </span>
                <Button
                  type="button"
                  variant="outline"
                  color="neutral"
                  size="xs"
                  onClick={() => setDockerModalOpen(true)}
                >
                  <Icon iconName="pen" iconStyle="regular" />
                  Edit
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
                  <Icon iconName="trash-can" iconStyle="regular" />
                </Button>
              </div>
            ) : (
              <div>
                <Button
                  type="button"
                  variant="outline"
                  color="neutral"
                  size="sm"
                  onClick={() => setDockerModalOpen(true)}
                >
                  <Icon iconName="code" iconStyle="regular" />
                  Add raw
                </Button>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <Heading level={3} weight="medium">
                Governance
              </Heading>
              <p className="mt-1 text-xs text-neutral-subtle">
                Control which external domains the agent task can access.
              </p>
            </div>
            <InputTextArea
              name={`whitelist-hosts-${panel}`}
              label="Domain allowlist"
              value={values.whitelistHosts}
              hint="Use * to allow all domains, or enter hostnames separated by commas."
              onChange={(event) => form.setValue('whitelistHosts', event.currentTarget.value, { shouldDirty: true })}
            />
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <Heading level={3} weight="medium">
                Advanced MCP configuration
              </Heading>
              <p className="mt-1 text-xs text-neutral-subtle">Configure additional MCP servers with JSON.</p>
            </div>
            <AgenticWorkflowCodeEditorField
              name={`mcp-${panel}`}
              label="MCP JSON"
              hideLabel
              language="json"
              value={values.mcpJson}
              error={mcpJsonError}
              onChange={(value) => form.setValue('mcpJson', value, { shouldDirty: true })}
            />
          </div>
        </div>
      </SettingsAccordionItem>
    </Accordion.Root>
  )

  const creationActions = () => (
    <div className="flex gap-2">
      <Button
        data-testid="button-create"
        type="button"
        variant="outline"
        loading={isCreating || isImportingVariables}
        onClick={() => handleSubmit(false)}
      >
        Create
      </Button>
      <Button
        data-testid="button-create-deploy"
        type="button"
        loading={isCreating || isImportingVariables || isDeploying}
        onClick={() => handleSubmit(true)}
      >
        Create and deploy
      </Button>
    </div>
  )

  return (
    <div className="flex min-h-0 w-full flex-col overflow-hidden bg-background">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral px-4 sm:px-6">
        <Button type="button" color="neutral" variant="plain" aria-label="Back" iconOnly onClick={onExit}>
          <Icon iconName="arrow-left" />
        </Button>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            color="neutral"
            variant="outline"
            className="lg:hidden"
            aria-label="Settings"
            onClick={() => setSettingsOpen(true)}
          >
            <Icon iconName="gear" />
            <span className="hidden md:inline">Settings</span>
          </Button>
          {creationActions()}
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <main className="min-w-0 flex-1 overflow-y-auto">
          <Section className="mx-auto flex max-w-[920px] flex-col gap-8 px-6 py-8 sm:px-10 sm:py-10">
            <div className="flex items-center gap-4">
              <ServiceAvatar
                size="custom"
                border="solid"
                className="h-12 w-12 shrink-0 bg-surface-neutral p-1.5"
                service={{ icon_uri: '', serviceType: 'AGENTIC_WORKFLOW' }}
              />
              <div>
                <Heading level={1}>Create agent task</Heading>
                <p className="mt-1 text-sm leading-5 text-neutral-subtle">
                  Describe what your agent task should do, then adjust its configuration when needed.
                </p>
              </div>
            </div>
            <section aria-label="Agent task capabilities" className="border-y border-neutral py-1">
              <ConfigurationRow label="Context">
                {values.gitRepositories.map((repository, index) =>
                  isGitRepositoryComplete(repository) ? (
                    <Button
                      key={`${repository.repository}-${index}`}
                      type="button"
                      size="sm"
                      color="neutral"
                      variant="outline"
                      className="max-w-full"
                      onClick={() => setContextModalOpen(true)}
                    >
                      <Icon iconName="github" iconStyle="brands" />
                      <span className="truncate">{repository.gitRepository?.name || repository.repository}</span>
                    </Button>
                  ) : null
                )}
                <Button
                  type="button"
                  size="sm"
                  color="neutral"
                  variant="plain"
                  className="border border-transparent group-hover:border-neutral group-hover:bg-surface-neutral"
                  onClick={() => setContextModalOpen(true)}
                >
                  <Icon iconName="circle-plus" iconStyle="regular" />
                  Add repository
                </Button>
              </ConfigurationRow>
              <ConfigurationRow label="Provider">
                <Button
                  type="button"
                  size="sm"
                  color="neutral"
                  variant="outline"
                  onClick={() => setProviderModalOpen(true)}
                >
                  <img src="/assets/ai-tools/claude.svg" alt="" aria-hidden="true" className="h-4 w-4" />
                  Anthropic
                </Button>
                {!values.modelApiKey.trim() ? (
                  <span
                    className={`text-xs ${showValidationErrors ? 'font-medium text-negative' : 'text-neutral-subtle'}`}
                  >
                    API key required
                  </span>
                ) : null}
              </ConfigurationRow>
              <ConfigurationRow label="MCP">
                {availableMcpServers
                  .filter(({ id }) => values.mcpServerIds.includes(id))
                  .map(({ id, name }) => (
                    <div
                      key={id}
                      className="flex h-6 max-w-full items-center rounded border border-neutral bg-surface-neutral pl-2 text-ssm font-medium text-neutral"
                    >
                      <span className="truncate">{name}</span>
                      <Button
                        type="button"
                        size="sm"
                        color="neutral"
                        variant="plain"
                        iconOnly
                        className="h-5 w-5 hover:bg-transparent"
                        aria-label={`Remove ${name}`}
                        onClick={() =>
                          form.setValue(
                            'mcpServerIds',
                            values.mcpServerIds.filter((mcpServerId) => mcpServerId !== id),
                            { shouldDirty: true }
                          )
                        }
                      >
                        <Icon iconName="xmark" className="text-xs" />
                      </Button>
                    </div>
                  ))}
                <Button
                  type="button"
                  size="sm"
                  color="neutral"
                  variant="plain"
                  className="border border-transparent group-hover:border-neutral group-hover:bg-surface-neutral"
                  onClick={() => setMcpModalOpen(true)}
                >
                  <Icon iconName="circle-plus" iconStyle="regular" />
                  Add MCP
                </Button>
              </ConfigurationRow>
              <ConfigurationRow label="Automations">
                {values.scheduleEnabled ? (
                  <Button
                    type="button"
                    size="sm"
                    color="neutral"
                    variant="outline"
                    onClick={() => setScheduleModalOpen(true)}
                  >
                    <Icon iconName="clock" iconStyle="regular" />
                    {values.scheduleCronExpression}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    color="neutral"
                    variant="plain"
                    className="border border-transparent group-hover:border-neutral group-hover:bg-surface-neutral"
                    onClick={() => setScheduleModalOpen(true)}
                  >
                    <Icon iconName="circle-plus" iconStyle="regular" />
                    Add automation
                  </Button>
                )}
              </ConfigurationRow>
            </section>
            <AgenticWorkflowPromptEditor
              ref={promptEditorRef}
              environmentId={environmentId}
              name={values.name}
              nameError={showNameError ? 'Please enter an agent task name.' : undefined}
              prompt={values.agentPrompt}
              promptError={showPromptError ? 'Please describe what the agent task should do.' : undefined}
              variableKeys={variableValues.map((variable) => variable.variable ?? '').filter(Boolean)}
              onNameChange={(value) => form.setValue('name', value, { shouldDirty: true })}
              onPromptChange={(value) => form.setValue('agentPrompt', value, { shouldDirty: true })}
            />
          </Section>
        </main>

        <aside
          aria-label="Agent task settings"
          className="hidden w-[380px] shrink-0 overflow-y-auto border-l border-neutral bg-background-secondary lg:block"
        >
          {settingsContent('desktop')}
        </aside>
      </div>

      <Dialog.Root open={settingsOpen} onOpenChange={setSettingsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-overlay bg-background-overlay lg:hidden" />
          <Dialog.Content asChild>
            <Sheet className="fixed bottom-0 right-0 top-0 z-modal w-[min(400px,calc(100vw-24px))] overscroll-contain lg:hidden">
              <div className="flex items-center justify-between border-b border-neutral px-5 py-4">
                <div>
                  <Dialog.Title className="font-medium text-neutral">Settings</Dialog.Title>
                  <Dialog.Description className="mt-1 text-xs text-neutral-subtle">
                    Configure how this agent task runs and connects.
                  </Dialog.Description>
                </div>
                <Dialog.Close asChild>
                  <Button aria-label="Close settings" type="button" color="neutral" variant="plain" iconOnly>
                    <Icon iconName="xmark" />
                  </Button>
                </Dialog.Close>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">{settingsContent('mobile')}</div>
            </Sheet>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {contextModalOpen ? (
        <Modal externalOpen={contextModalOpen} setExternalOpen={setContextModalOpen} width={640}>
          <ConfigurationModalContent
            title="Configure Git repositories"
            description="Add the Git repositories the agent task can use as context."
            doneDisabled={!gitRepositoriesValid}
            setOpen={setContextModalOpen}
          >
            <div className="flex">
              <Button type="button" variant="outline" color="neutral" size="sm" onClick={addRepository}>
                <Icon iconName="plus" />
                Add repository
              </Button>
            </div>
            {values.gitRepositories.map((repository, index) => (
              <GitRepositoryCard
                key={index}
                index={index}
                repository={repository}
                onChange={(nextRepository) => {
                  const gitRepositories = [...values.gitRepositories]
                  gitRepositories[index] = nextRepository
                  form.setValue('gitRepositories', gitRepositories, { shouldDirty: true })
                }}
                onRemove={() =>
                  form.setValue(
                    'gitRepositories',
                    values.gitRepositories.filter((_, repositoryIndex) => repositoryIndex !== index),
                    { shouldDirty: true }
                  )
                }
              />
            ))}
            {!gitRepositoriesValid ? (
              <p className="text-xs font-medium text-negative">
                Select a Git account, repository, and branch for each repository.
              </p>
            ) : null}
          </ConfigurationModalContent>
        </Modal>
      ) : null}

      {providerModalOpen ? (
        <Modal externalOpen={providerModalOpen} setExternalOpen={setProviderModalOpen} width={520}>
          <ConfigurationModalContent
            title="Configure provider"
            description="Choose the AI provider and configure its credentials and cloud settings."
            setOpen={setProviderModalOpen}
          >
            <AIModelCards />
            <InputText
              ref={modelApiKeyInputRef}
              name="model-api-key-provider"
              label="API key"
              type="password"
              value={values.modelApiKey}
              hint="API key used to call the selected cloud model."
              error={showModelApiKeyError ? 'Please enter an API key.' : undefined}
              onChange={(event) => form.setValue('modelApiKey', event.currentTarget.value, { shouldDirty: true })}
            />
            <AgenticWorkflowCodeEditorField
              name="model-settings-provider"
              label="Cloud settings JSON"
              language="json"
              value={values.modelSettingsJson}
              error={modelSettingsJsonError}
              hint={
                <>
                  Configure the cloud model runtime. Read the{' '}
                  <a
                    href="https://code.claude.com/docs/en/settings"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-brand hover:underline"
                  >
                    Claude Code settings documentation
                  </a>
                  .
                </>
              }
              onChange={(value) => form.setValue('modelSettingsJson', value, { shouldDirty: true })}
            />
          </ConfigurationModalContent>
        </Modal>
      ) : null}

      {mcpModalOpen ? (
        <Modal externalOpen={mcpModalOpen} setExternalOpen={setMcpModalOpen} width={520}>
          <ConfigurationModalContent
            title="Configure MCP"
            description="Select the organization MCPs this agent task can use."
            setOpen={setMcpModalOpen}
          >
            <McpServerPicker
              isLoading={areMcpServersLoading}
              mcpServers={mcpServers}
              createdMcpServers={createdMcpServers}
              value={values.mcpServerIds}
              onChange={(value) => form.setValue('mcpServerIds', value as string[], { shouldDirty: true })}
              onMcpServerCreated={(mcpServer) =>
                setCreatedMcpServers((servers) =>
                  servers.some(({ id }) => id === mcpServer.id) ? servers : [...servers, mcpServer]
                )
              }
            />
          </ConfigurationModalContent>
        </Modal>
      ) : null}

      {scheduleModalOpen ? (
        <Modal externalOpen={scheduleModalOpen} setExternalOpen={setScheduleModalOpen} width={520}>
          <ConfigurationModalContent
            title="Configure automation"
            setOpen={setScheduleModalOpen}
            description={
              <>
                Schedule this agent task to run automatically in addition to webhook requests. Use the{' '}
                <ExternalLink href="https://crontab.guru/" size="sm">
                  CRON expression builder
                </ExternalLink>
                .
              </>
            }
          >
            <AgenticWorkflowScheduleFields showCronBuilderLink={false} />
          </ConfigurationModalContent>
        </Modal>
      ) : null}

      {dockerModalOpen ? (
        <Modal externalOpen={dockerModalOpen} setExternalOpen={setDockerModalOpen} width={720}>
          <DockerFragmentModal setOpen={setDockerModalOpen} />
        </Modal>
      ) : null}
    </div>
  )
}
