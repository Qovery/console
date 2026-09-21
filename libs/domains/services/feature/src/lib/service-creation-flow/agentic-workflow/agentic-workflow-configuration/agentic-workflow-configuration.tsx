import { useNavigate, useParams } from '@tanstack/react-router'
import clsx from 'clsx'
import posthog from 'posthog-js'
import {
  APIVariableScopeEnum,
  type AgenticWorkflowModelType,
  LlmProviderType,
  type McpServerResponse,
} from 'qovery-typescript-axios'
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { Controller, FormProvider, useFieldArray } from 'react-hook-form'
import {
  LlmProviderSetting,
  useCreateQoveryMcpServer,
  useLlmProviders,
  useMcpServers,
} from '@qovery/domains/organizations/feature'
import { VariableRow, useImportVariables } from '@qovery/domains/variables/feature'
import { IconEnum } from '@qovery/shared/enums'
import { type VariableData } from '@qovery/shared/interfaces'
import {
  Accordion,
  Button,
  CodeEditor,
  DropdownMenu,
  ExternalLink,
  Heading,
  Icon,
  InputText,
  InputTextArea,
  Modal,
  Section,
  Tooltip,
  useModal,
} from '@qovery/shared/ui'
import {
  ENVIRONMENT_VARIABLE_NAME_PATTERN,
  formatCronExpression,
  prepareVariableImportRequest,
} from '@qovery/shared/util-js'
import { AgenticWorkflowExecutionModeSelector } from '../../../agentic-workflow-execution-mode-selector/agentic-workflow-execution-mode-selector'
import { useAgenticWorkflowContextServices } from '../../../hooks/use-agentic-workflow-context-services/use-agentic-workflow-context-services'
import { useCreateService } from '../../../hooks/use-create-service/use-create-service'
import {
  type AgenticWorkflowAutomation,
  type AgenticWorkflowGitRepository,
  createDefaultAutomation,
  useAgenticWorkflowCreateContext,
} from '../agentic-workflow-context'
import { formatAgenticWorkflowRequest } from '../agentic-workflow-request'
import { AGENT_TASKS_DOC_LINK } from '../agentic-workflow-templates'
import { AgenticWorkflowPromptEditor, type AgenticWorkflowPromptEditorHandle } from './agentic-workflow-prompt-editor'
import { AutomationSheet } from './automations/automation-sheet'
import { GitContextCard, GitContextCompactCard } from './context/git-context-card'
import { GitContextModal } from './context/git-context-modal'
import { QoveryServiceContextCard, QoveryServiceContextCompactCard } from './context/qovery-service-context-card'
import { QoveryServiceContextModal } from './context/qovery-service-context-modal'
import { AgenticWorkflowHeader, type AgenticWorkflowHeaderHandle } from './header/agentic-workflow-header'
import { McpSheet } from './mcp/mcp-sheet'
import { getMcpServerDisplayName, isQoveryMcpServer } from './mcp/qovery-mcp-server'

type SettingsGroup = 'general' | 'resources' | 'governance' | 'variables' | 'advanced'

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

export function summarizeTriggers(automation: AgenticWorkflowAutomation) {
  return automation.triggers
    .map((trigger) => {
      if (trigger.type === 'webhook') return 'Webhook'

      const schedule = formatCronExpression(trigger.cronExpression) || trigger.cronExpression || 'Schedule'
      return trigger.timezone ? `${schedule} (${trigger.timezone})` : schedule
    })
    .join(' + ')
}

export function areVariablesValid(variables: VariableData[]) {
  return variables.every((variable) => getInvalidVariableField(variable) === undefined)
}

export function getInvalidVariableField({ variable, value, scope }: VariableData) {
  if (!scope) return 'scope' as const
  if (!value) return 'value' as const
  if (!variable || !ENVIRONMENT_VARIABLE_NAME_PATTERN.test(variable)) return 'variable' as const

  return undefined
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
        className={clsx('w-full cursor-pointer justify-between gap-3 px-4 py-4 text-left focus-visible:outline-none', {
          'bg-surface-negative-subtle focus-visible:bg-surface-negative-subtle': invalid,
          'bg-background-secondary focus-visible:bg-surface-neutral-subtle': !invalid,
        })}
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
      <Accordion.Content className={invalid ? 'bg-surface-negative-subtle' : 'bg-background-secondary'}>
        <div className="flex flex-col gap-4 px-4 pb-5">{children}</div>
      </Accordion.Content>
    </Accordion.Item>
  )
}

function ConfigurationModalContent({
  children,
  confirmLabel = 'Done',
  description,
  doneDisabled = false,
  setOpen,
  title,
}: {
  children: ReactNode
  confirmLabel?: string
  description: ReactNode
  doneDisabled?: boolean
  setOpen?: (open: boolean) => void
  title: string
}) {
  return (
    <Section className="gap-5 p-5">
      <div className="flex flex-col gap-1 pr-8">
        <Heading level={2} className="text-xl font-medium leading-7 text-neutral">
          {title}
        </Heading>
        <p className="text-sm leading-5 text-neutral-subtle">{description}</p>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="plain" color="neutral" size="md" onClick={() => setOpen?.(false)}>
          Cancel
        </Button>
        <Button type="button" size="md" disabled={doneDisabled} onClick={() => setOpen?.(false)}>
          {confirmLabel}
        </Button>
      </div>
    </Section>
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
    <Section className="gap-5 p-5">
      <div className="flex flex-col gap-1 pr-8">
        <Heading level={2} className="text-xl font-medium leading-7 text-neutral">
          {dockerFragment ? 'Edit Dockerfile fragment' : 'Add Dockerfile fragment'}
        </Heading>
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
      <div className="flex justify-end gap-2">
        <Button type="button" variant="plain" color="neutral" size="md" onClick={() => setOpen?.(false)}>
          Cancel
        </Button>
        <Button
          type="button"
          size="md"
          onClick={() => {
            form.setValue('dockerFragment', value, { shouldDirty: true })
            setOpen?.(false)
          }}
        >
          Save fragment
        </Button>
      </div>
    </Section>
  )
}

export function AgenticWorkflowConfiguration() {
  const { environmentId = '', organizationId = '', projectId = '' } = useParams({ strict: false })
  const {
    data: mcpServers = [],
    isError: areMcpServersError,
    isLoading: areMcpServersLoading,
    refetch: refetchMcpServers,
  } = useMcpServers({ organizationId })
  const { data: llmProviders = [], isLoading: areLlmProvidersLoading } = useLlmProviders({ organizationId })
  const { data: contextServices = [], isLoading: areContextServicesLoading } =
    useAgenticWorkflowContextServices(environmentId)
  const navigate = useNavigate()
  const { closeModal, openModal } = useModal()
  const { form, onExit, requiresQoveryMcp, variablesForm, selectedTemplate } = useAgenticWorkflowCreateContext()
  const { isLoading: isCreatingQoveryMcpServer, mutateAsync: createQoveryMcpServer } = useCreateQoveryMcpServer()
  const { isLoading: isCreating, mutateAsync: createService } = useCreateService({ organizationId })
  const { isLoading: isImportingVariables, mutateAsync: importVariables } = useImportVariables()
  const {
    fields: variables,
    append: appendVariable,
    remove: removeVariable,
  } = useFieldArray({
    control: variablesForm.control,
    name: 'variables',
  })
  const [openSettingsGroups, setOpenSettingsGroups] = useState<SettingsGroup[]>(() => {
    const groups: SettingsGroup[] = ['general']
    // When a template pre-fills a section but leaves it incomplete (e.g. seeded
    // secrets with empty values), open it so the user sees what to fill in.
    const initialVariables = variablesForm.getValues('variables')
    if (initialVariables.length > 0 && !areVariablesValid(initialVariables)) {
      groups.push('variables')
    }
    return groups
  })
  const [providerModalOpen, setProviderModalOpen] = useState(false)
  const [activeSheet, setActiveSheet] = useState<'mcp' | 'triggers' | 'outputs' | null>(null)
  const [createdMcpServers, setCreatedMcpServers] = useState<McpServerResponse[]>([])
  const [dockerModalOpen, setDockerModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showValidationErrors, setShowValidationErrors] = useState(false)
  const headerRef = useRef<AgenticWorkflowHeaderHandle>(null)
  const promptEditorRef = useRef<AgenticWorkflowPromptEditorHandle>(null)
  const createdServiceIdRef = useRef<string>()
  const qoveryMcpInitializationStartedRef = useRef(false)
  const qoveryMcpInitializationPromiseRef = useRef<Promise<McpServerResponse>>()
  const submissionInFlightRef = useRef(false)
  const values = form.watch()
  const { dirtyFields } = form.formState
  const modelSettingsJsonError = getJsonError(values.modelSettingsJson, true)
  const gitRepositoriesValid = values.gitRepositories.every(isGitRepositoryComplete)
  const variableValues = variablesForm.watch('variables')
  const variablesValid = areVariablesValid(variableValues)
  const showNameError = (showValidationErrors || Boolean(dirtyFields.name)) && !values.name.trim()
  const showPromptError = (showValidationErrors || Boolean(dirtyFields.agentPrompt)) && !values.agentPrompt.trim()
  const hasModelCredential = Boolean(values.llmProviderId)
  const showLlmProviderError = (showValidationErrors || Boolean(dirtyFields.llmProviderId)) && !hasModelCredential
  const providerConfigurationInvalid = !hasModelCredential || Boolean(modelSettingsJsonError)
  const availableLlmProviders = llmProviders.filter(({ has_credential }) => has_credential)
  const selectedProvider = llmProviders.find(({ id }) => id === values.llmProviderId)
  const isBedrockProvider = selectedProvider?.type === LlmProviderType.BEDROCK
  const settingsGroupsInvalid: Record<SettingsGroup, boolean> = {
    general: false,
    resources: false,
    governance: false,
    variables: !variablesValid,
    advanced: false,
  }
  const automation = values.automations[0] ?? createDefaultAutomation()
  const automationValid = automation.triggers.length > 0
  const needsQoveryMcp = requiresQoveryMcp || values.contextServices.length > 0
  const availableMcpServers = [...mcpServers, ...createdMcpServers].filter(
    (mcpServer, index, servers) => servers.findIndex(({ id }) => id === mcpServer.id) === index
  )
  const qoveryMcpServer = availableMcpServers.find((mcpServer) => mcpServer.attachable && isQoveryMcpServer(mcpServer))
  const isQoveryMcpSelected = Boolean(qoveryMcpServer && values.mcpServerIds.includes(qoveryMcpServer.id))
  const qoveryMcpLockReason = requiresQoveryMcp
    ? 'This MCP is required by the selected agent template and cannot be removed.'
    : values.contextServices.length > 0
      ? 'This MCP is required by the selected Qovery service context and cannot be removed.'
      : undefined
  const ensureQoveryMcpServer = useCallback(async () => {
    let loadedMcpServers = mcpServers
    if (areMcpServersLoading || areMcpServersError) {
      const result = await refetchMcpServers()
      if (result.isError || !result.data) {
        throw result.error ?? new Error('Unable to load MCP servers')
      }
      loadedMcpServers = result.data
    }
    const existingQoveryMcpServer = [...loadedMcpServers, ...createdMcpServers].find(
      (mcpServer) => mcpServer.attachable && isQoveryMcpServer(mcpServer)
    )
    if (!qoveryMcpInitializationPromiseRef.current) {
      qoveryMcpInitializationPromiseRef.current = existingQoveryMcpServer
        ? Promise.resolve(existingQoveryMcpServer)
        : createQoveryMcpServer({ organizationId })
            .then((mcpServer) => ({ ...mcpServer, attachable: true }))
            .catch((error) => {
              qoveryMcpInitializationPromiseRef.current = undefined
              throw error
            })
    }

    const mcpServer = await qoveryMcpInitializationPromiseRef.current

    if (!existingQoveryMcpServer) {
      setCreatedMcpServers((servers) =>
        servers.some(({ id }) => id === mcpServer.id) ? servers : [...servers, mcpServer]
      )
    }

    const selectedMcpServerIds = form.getValues('mcpServerIds')
    if (!selectedMcpServerIds.includes(mcpServer.id)) {
      form.setValue('mcpServerIds', [...selectedMcpServerIds, mcpServer.id], { shouldDirty: true })
    }

    return mcpServer
  }, [
    areMcpServersError,
    areMcpServersLoading,
    createQoveryMcpServer,
    createdMcpServers,
    form,
    mcpServers,
    organizationId,
    refetchMcpServers,
  ])

  useEffect(() => {
    if (!requiresQoveryMcp || areMcpServersLoading || qoveryMcpInitializationStartedRef.current) return

    qoveryMcpInitializationStartedRef.current = true
    void ensureQoveryMcpServer().catch(() => undefined)
  }, [areMcpServersLoading, ensureQoveryMcpServer, requiresQoveryMcp])
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

  const openQoveryServiceContext = () => {
    if (areContextServicesLoading || areMcpServersLoading) return

    openModal({
      content: (
        <QoveryServiceContextModal
          isLoading={areContextServicesLoading}
          services={contextServices}
          value={values.contextServices}
          setOpen={(open) => {
            if (!open) closeModal()
          }}
          onSave={async (services) => {
            if (services.length > 0) await ensureQoveryMcpServer()
            form.setValue('contextServices', services, { shouldDirty: true })
          }}
        />
      ),
      options: {
        width: 488,
        fakeModal: true,
      },
    })
  }

  const openSettingsGroup = (group: SettingsGroup) => {
    setOpenSettingsGroups((groups) => (groups.includes(group) ? groups : [...groups, group]))
  }

  const validateConfiguration = async () => {
    setShowValidationErrors(true)
    if (!variablesValid) {
      setOpenSettingsGroups((groups) => (groups.includes('variables') ? groups : [...groups, 'variables']))
      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()))
      })
      await variablesForm.trigger()
    }

    if (!values.name.trim()) {
      headerRef.current?.focusName()
      return false
    }

    if (!values.agentPrompt.trim()) {
      promptEditorRef.current?.focusPrompt()
      return false
    }

    if (providerConfigurationInvalid) {
      setProviderModalOpen(true)
      return false
    }

    if (!gitRepositoriesValid) {
      const invalidIndex = values.gitRepositories.findIndex((repository) => !isGitRepositoryComplete(repository))
      openGitContext(invalidIndex >= 0 ? invalidIndex : undefined)
      return false
    }

    if (!automationValid) {
      return false
    }

    const firstInvalidGroup = (['general', 'resources', 'variables', 'advanced'] as const).find(
      (group) => settingsGroupsInvalid[group]
    )

    if (firstInvalidGroup) {
      openSettingsGroup(firstInvalidGroup)

      const invalidVariableIndex =
        firstInvalidGroup === 'variables'
          ? variableValues.findIndex((variable) => getInvalidVariableField(variable) !== undefined)
          : -1
      const invalidField =
        invalidVariableIndex >= 0 ? getInvalidVariableField(variableValues[invalidVariableIndex]) : undefined

      // A single frame chain keeps the focus order deterministic: focusing the group trigger and
      // the invalid field from two separate chains lets the trigger win under load.
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          const invalidInput =
            invalidVariableIndex >= 0
              ? document.querySelector<HTMLElement>(`[name="variables.${invalidVariableIndex}.${invalidField}"]`)
              : null
          const variableRow =
            invalidVariableIndex >= 0
              ? document.querySelector<HTMLElement>(`[data-variable-row-index="${invalidVariableIndex}"]`)
              : null
          const groupTrigger = document.querySelector<HTMLElement>(
            `[data-settings-panel="desktop"] [data-settings-group="${firstInvalidGroup}"]`
          )
          const focusTarget = invalidInput ?? variableRow ?? groupTrigger
          focusTarget?.focus({ preventScroll: true })
        })
      })
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (submissionInFlightRef.current) return

    submissionInFlightRef.current = true
    setIsSubmitting(true)

    try {
      if (!(await validateConfiguration())) return

      let requiredMcpServerIds: string[] = []
      if (needsQoveryMcp) {
        const qoveryMcpServer = await ensureQoveryMcpServer()
        requiredMcpServerIds = [qoveryMcpServer.id]
      }

      if (!createdServiceIdRef.current) {
        const service = await createService({
          environmentId,
          payload: {
            serviceType: 'AGENTIC_WORKFLOW',
            ...formatAgenticWorkflowRequest(form.getValues(), requiredMcpServerIds),
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

      posthog.capture('agent-task-form-submitted', { success: true })
      posthog.capture('create-service', { selectedServiceType: 'agentic-workflow' })
      navigate({
        to: '/organization/$organizationId/project/$projectId/environment/$environmentId/overview',
        params: { organizationId, projectId, environmentId },
      })
    } catch {
      posthog.capture('agent-task-form-submitted', { success: false })
      // Errors are surfaced by mutation notifications. Keep the created service ID so a retry does not duplicate it.
    } finally {
      submissionInFlightRef.current = false
      setIsSubmitting(false)
    }
  }

  const settingsContent = (
    <Accordion.Root
      data-settings-panel="desktop"
      type="multiple"
      value={openSettingsGroups}
      onValueChange={(groups) => setOpenSettingsGroups(groups as SettingsGroup[])}
    >
      <SettingsAccordionItem
        value="general"
        title="General settings"
        invalid={showValidationErrors && settingsGroupsInvalid.general}
      >
        <Controller
          name="description"
          control={form.control}
          render={({ field }) => (
            <InputTextArea name={field.name} label="Description" value={field.value} onChange={field.onChange} />
          )}
        />
      </SettingsAccordionItem>

      <SettingsAccordionItem value="resources" title="Resources" invalid={false}>
        <div className="grid gap-3">
          <Controller
            name="cpu"
            control={form.control}
            render={({ field }) => (
              <InputText
                name={field.name}
                label="CPU (mCPU)"
                type="number"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="memory"
            control={form.control}
            render={({ field }) => (
              <InputText
                name={field.name}
                label="Memory (MB)"
                type="number"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="storage"
            control={form.control}
            render={({ field }) => (
              <InputText
                name={field.name}
                label="Storage (GB)"
                type="number"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </SettingsAccordionItem>

      <SettingsAccordionItem value="governance" title="Governance" invalid={false}>
        <div className="flex flex-col gap-3">
          <p className="text-xs text-neutral-subtle">Control which external domains the agent task can access.</p>
          <Controller
            name="whitelistHosts"
            control={form.control}
            render={({ field }) => (
              <InputTextArea
                name={field.name}
                label="Domain allowlist"
                value={field.value}
                hint="Use * to allow all domains, or enter hostnames separated by commas."
                onChange={field.onChange}
              />
            )}
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
                isSecret: false,
              })
            }
          >
            <Icon iconName="circle-plus" iconStyle="regular" />
            Add variable
          </Button>
          <Button
            type="button"
            variant="solid"
            color="neutral"
            size="sm"
            className="border border-neutralInvert"
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
                  errorMessagePosition="none"
                  onDelete={removeVariable}
                />
              ))}
            </div>
          ) : null}
        </FormProvider>
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
                Execution mode
              </Heading>
              <p className="mt-1 text-xs text-neutral-subtle">Choose how each agent task execution is isolated.</p>
            </div>
            <AgenticWorkflowExecutionModeSelector
              value={values.executionMode}
              onChange={(mode) => form.setValue('executionMode', mode, { shouldDirty: true })}
            />
          </div>
        </div>
      </SettingsAccordionItem>
    </Accordion.Root>
  )

  const creationActions = () => (
    <Button
      data-testid="button-create"
      type="button"
      disabled={needsQoveryMcp && areMcpServersLoading}
      loading={isCreating || isImportingVariables || isCreatingQoveryMcpServer || isSubmitting}
      onClick={handleSubmit}
    >
      Create
    </Button>
  )

  return (
    <div className="flex min-h-0 w-full flex-col overflow-hidden bg-background">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral px-4">
        <Button type="button" color="neutral" variant="plain" aria-label="Back" iconOnly onClick={onExit}>
          <Icon iconName="arrow-left" />
        </Button>
        <div className="flex items-center gap-4">
          <ExternalLink href={selectedTemplate?.docLink ?? AGENT_TASKS_DOC_LINK} size="xs">
            Documentation
          </ExternalLink>
          {creationActions()}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        <main className="min-w-0 flex-1 lg:overflow-y-auto">
          <Section className="mx-auto flex max-w-[920px] flex-col px-6 py-8 sm:px-10 sm:py-10">
            <AgenticWorkflowHeader
              ref={headerRef}
              name={values.name}
              nameError={showNameError ? 'Please enter an agent task name.' : undefined}
              onNameChange={(value) => form.setValue('name', value, { shouldDirty: true })}
            />
            <section aria-label="Context" className="flex flex-col gap-2 py-6">
              <h2 className="text-sm font-medium text-neutral-subtle">Context</h2>
              {values.gitRepositories.length > 0 || values.contextServices.length > 0 ? (
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <Button type="button" variant="outline" color="neutral" size="sm" className="w-fit">
                      Add context
                      <Icon iconName="chevron-down" />
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    <DropdownMenu.Item
                      icon={<Icon name={IconEnum.GIT} width={16} height={16} />}
                      onSelect={() => openGitContext()}
                    >
                      Git repository
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      icon={<Icon name={IconEnum.QOVERY} width={16} height={16} />}
                      disabled={areContextServicesLoading || areMcpServersLoading}
                      onSelect={openQoveryServiceContext}
                    >
                      Qovery services
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              ) : null}
              <div className="flex flex-wrap gap-3">
                {values.gitRepositories.length > 0 || values.contextServices.length > 0 ? (
                  <>
                    {values.gitRepositories.map((repository, index) => (
                      <GitContextCompactCard
                        key={`${repository.repository}-${index}`}
                        provider={repository.provider}
                        repository={
                          repository.gitRepository?.name || repository.repository || 'Configure Git repository'
                        }
                        url={repository.gitRepository?.url ?? repository.repository}
                        onClick={() => openGitContext(index)}
                      />
                    ))}
                    {values.contextServices.length > 0 ? (
                      <QoveryServiceContextCompactCard
                        disabled={areContextServicesLoading || areMcpServersLoading}
                        names={values.contextServices.map(({ name }) => name)}
                        onClick={openQoveryServiceContext}
                      />
                    ) : null}
                  </>
                ) : (
                  <>
                    <QoveryServiceContextCard
                      disabled={areContextServicesLoading || areMcpServersLoading}
                      onClick={openQoveryServiceContext}
                    />
                    <GitContextCard onClick={() => openGitContext()} />
                  </>
                )}
              </div>
            </section>
            <section aria-label="Agent task capabilities" className="border-t border-neutral py-3">
              <ConfigurationRow label="Provider">
                {hasModelCredential ? (
                  <Button
                    type="button"
                    size="sm"
                    color="neutral"
                    variant="outline"
                    onClick={() => setProviderModalOpen(true)}
                  >
                    <img
                      src={isBedrockProvider ? '/assets/ai-tools/bedrock.svg' : '/assets/ai-tools/claude.svg'}
                      alt=""
                      aria-hidden="true"
                      className="h-4 w-4"
                    />
                    {isBedrockProvider ? 'Amazon Bedrock' : 'Anthropic'}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    color="neutral"
                    variant="outline"
                    onClick={() => setProviderModalOpen(true)}
                  >
                    <Icon iconName="circle-plus" iconStyle="regular" />
                    Add provider
                  </Button>
                )}
                {!hasModelCredential && showValidationErrors ? (
                  <span className="text-xs font-medium text-negative">Token required</span>
                ) : null}
              </ConfigurationRow>
              <ConfigurationRow label="MCP">
                {requiresQoveryMcp && !isQoveryMcpSelected ? (
                  <div className="flex h-7 max-w-full items-center gap-1 rounded border border-neutral bg-surface-neutral pl-2 pr-1 text-ssm font-medium text-neutral">
                    <span className="truncate">MCP Qovery</span>
                    {isCreatingQoveryMcpServer ? (
                      <span className="flex h-5 w-5 items-center justify-center" aria-label="Configuring MCP Qovery">
                        <Icon
                          iconName="loader"
                          iconStyle="regular"
                          className="animate-spin text-xs text-neutral-subtle"
                        />
                      </span>
                    ) : null}
                  </div>
                ) : null}
                {availableMcpServers
                  .filter(({ id }) => values.mcpServerIds.includes(id))
                  .map((mcpServer) => {
                    const { id } = mcpServer
                    const name = getMcpServerDisplayName(mcpServer)
                    const locked = Boolean(qoveryMcpLockReason && qoveryMcpServer?.id === id)
                    const chip = (
                      <div
                        className={clsx(
                          'flex h-7 max-w-full items-center rounded border border-neutral bg-surface-neutral pl-2 pr-1 text-ssm font-medium text-neutral',
                          locked && 'opacity-50'
                        )}
                      >
                        <span className="truncate">{name}</span>
                        {locked ? (
                          <span className="flex h-5 w-5 items-center justify-center" aria-hidden="true">
                            <Icon iconName="xmark" className="text-xs" />
                          </span>
                        ) : (
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
                        )}
                      </div>
                    )

                    return locked ? (
                      <Tooltip key={id} content={qoveryMcpLockReason} classNameTrigger="block">
                        <div>{chip}</div>
                      </Tooltip>
                    ) : (
                      <div key={id}>{chip}</div>
                    )
                  })}
                <Button type="button" size="sm" color="neutral" variant="outline" onClick={() => setActiveSheet('mcp')}>
                  <Icon iconName="circle-plus" iconStyle="regular" />
                  Add MCP
                </Button>
              </ConfigurationRow>
              <ConfigurationRow label="Triggers">
                <Button
                  type="button"
                  size="sm"
                  color="neutral"
                  variant="outline"
                  className="max-w-full"
                  onClick={() => setActiveSheet('triggers')}
                >
                  <Icon iconName="stopwatch" iconStyle="regular" />
                  <span className="truncate">
                    {automation.triggers.length ? summarizeTriggers(automation) : 'Add trigger'}
                  </span>
                </Button>
                {!automation.triggers.length ? (
                  <span
                    className={`text-xs ${showValidationErrors ? 'font-medium text-negative' : 'text-neutral-subtle'}`}
                  >
                    Trigger required
                  </span>
                ) : null}
              </ConfigurationRow>
              <ConfigurationRow label="Output">
                <Button
                  type="button"
                  size="sm"
                  color="neutral"
                  variant="outline"
                  className="max-w-full"
                  onClick={() => setActiveSheet('outputs')}
                >
                  <Icon iconName="webhook" iconStyle="regular" />
                  <span className="truncate">
                    {automation.outputs.length
                      ? `${automation.outputs.length} output${automation.outputs.length > 1 ? 's' : ''}`
                      : 'Add output'}
                  </span>
                </Button>
              </ConfigurationRow>
            </section>
            <section aria-label="Instructions" className="border-t border-neutral pt-6">
              <AgenticWorkflowPromptEditor
                ref={promptEditorRef}
                prompt={values.agentPrompt}
                promptError={showPromptError ? 'Please describe what the agent task should do.' : undefined}
                variableKeys={variableValues.map((variable) => variable.variable ?? '').filter(Boolean)}
                onPromptChange={(value) => form.setValue('agentPrompt', value, { shouldDirty: true })}
              />
            </section>
          </Section>
        </main>

        <aside
          aria-label="Agent task settings"
          className="shrink-0 border-t border-neutral bg-background-secondary lg:h-full lg:w-[380px] lg:overflow-y-auto lg:border-l lg:border-t-0"
        >
          {settingsContent}
        </aside>
      </div>

      {providerModalOpen ? (
        <Modal externalOpen={providerModalOpen} setExternalOpen={setProviderModalOpen} width={520}>
          <ConfigurationModalContent
            title="Configure provider"
            description="Configure the model provider token and cloud settings for the agent task."
            confirmLabel="Save provider"
            setOpen={setProviderModalOpen}
          >
            <Controller
              name="llmProviderId"
              control={form.control}
              render={({ field }) => (
                <LlmProviderSetting
                  displayEmptyState
                  llmProviders={availableLlmProviders}
                  isLoading={areLlmProvidersLoading}
                  error={showLlmProviderError ? 'Please select a token.' : undefined}
                  value={field.value}
                  onChange={(providerId) => {
                    field.onChange(providerId)
                    // Keep the model type aligned with the selected token's provider (Claude, Bedrock, ...)
                    const provider = availableLlmProviders.find(({ id }) => id === providerId)
                    if (provider) {
                      form.setValue('aiModel', provider.type as AgenticWorkflowModelType, { shouldDirty: true })
                    }
                  }}
                >
                  <Controller
                    name="modelSettingsJson"
                    control={form.control}
                    render={({ field }) => (
                      <AgenticWorkflowCodeEditorField
                        name={field.name}
                        label="Cloud settings JSON"
                        language="json"
                        value={field.value}
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
                        onChange={field.onChange}
                      />
                    )}
                  />
                </LlmProviderSetting>
              )}
            />
          </ConfigurationModalContent>
        </Modal>
      ) : null}

      {activeSheet === 'mcp' ? (
        <McpSheet
          isLoading={areMcpServersLoading}
          mcpServers={mcpServers}
          createdMcpServers={createdMcpServers}
          lockedMcpServerIds={qoveryMcpLockReason && qoveryMcpServer ? [qoveryMcpServer.id] : []}
          lockedMcpServerReason={qoveryMcpLockReason}
          value={values.mcpServerIds}
          onChange={(value) => form.setValue('mcpServerIds', value, { shouldDirty: true })}
          onClose={() => setActiveSheet(null)}
          onMcpServerCreated={(mcpServer) =>
            setCreatedMcpServers((servers) =>
              servers.some(({ id }) => id === mcpServer.id) ? servers : [...servers, mcpServer]
            )
          }
        />
      ) : null}

      {activeSheet === 'triggers' || activeSheet === 'outputs' ? (
        <AutomationSheet
          automation={automation}
          section={activeSheet}
          onClose={() => setActiveSheet(null)}
          onSave={(nextAutomation) => {
            form.setValue('automations', [nextAutomation], { shouldDirty: true })
          }}
        />
      ) : null}

      {dockerModalOpen ? (
        <Modal
          externalOpen={dockerModalOpen}
          setExternalOpen={setDockerModalOpen}
          width={720}
          className="max-w-[calc(100vw-2rem)]"
        >
          <DockerFragmentModal setOpen={setDockerModalOpen} />
        </Modal>
      ) : null}
    </div>
  )
}
