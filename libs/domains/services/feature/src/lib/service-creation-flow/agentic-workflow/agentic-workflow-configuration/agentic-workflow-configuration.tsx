import * as Dialog from '@radix-ui/react-dialog'
import { useNavigate, useParams } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { APIVariableScopeEnum, type McpServerResponse } from 'qovery-typescript-axios'
import { type ReactNode, useRef, useState } from 'react'
import { FormProvider, useFieldArray } from 'react-hook-form'
import { useMcpServers } from '@qovery/domains/organizations/feature'
import { VariableRow, useImportVariables } from '@qovery/domains/variables/feature'
import { type VariableData } from '@qovery/shared/interfaces'
import {
  Accordion,
  Button,
  CodeEditor,
  Heading,
  Icon,
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
import {
  type AgenticWorkflowAutomation,
  type AgenticWorkflowGitRepository,
  type AgenticWorkflowOutput,
  useAgenticWorkflowCreateContext,
} from '../agentic-workflow-context'
import { formatAgenticWorkflowRequest } from '../agentic-workflow-request'
import { AgenticWorkflowPromptEditor, type AgenticWorkflowPromptEditorHandle } from './agentic-workflow-prompt-editor'
import { AIModelCards } from './ai-model-cards'
import { AutomationSheet } from './automations'
import { GitContextCard, GitContextCompactCard, GitContextModal } from './context'
import { AgenticWorkflowHeader, type AgenticWorkflowHeaderHandle } from './header'
import { McpSheet } from './mcp'

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

export function isOutputComplete(output: AgenticWorkflowOutput) {
  return Boolean(output.url.trim())
}

export function summarizeAutomation(automation: AgenticWorkflowAutomation) {
  const triggers = automation.triggers.map((trigger) => (trigger.type === 'schedule' ? 'Schedule' : 'Webhook'))
  const summary = triggers.length ? triggers.join(' + ') : 'No trigger'
  return automation.output ? `${summary} → Output` : summary
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

function McpJsonModal({ setOpen }: { setOpen?: (open: boolean) => void }) {
  const { form } = useAgenticWorkflowCreateContext()
  const mcpJson = form.watch('mcpJson')
  const [value, setValue] = useState(mcpJson)
  const error = getJsonError(value)

  return (
    <Section className="gap-5 p-5">
      <div className="flex flex-col gap-1 pr-8">
        <Heading level={2} className="text-xl font-medium leading-7 text-neutral">
          {mcpJson ? 'Edit MCP configuration' : 'Add MCP configuration'}
        </Heading>
        <p className="text-sm leading-5 text-neutral-subtle">Configure additional MCP servers with JSON.</p>
      </div>
      <div className={`overflow-hidden rounded-md border ${error ? 'border-negative' : 'border-neutral'}`}>
        <CodeEditor
          height="320px"
          language="json"
          value={value}
          onChange={(nextValue) => setValue(nextValue ?? '')}
          options={{ scrollBeyondLastLine: false, wordWrap: 'on' }}
        />
      </div>
      {error ? <p className="text-xs font-medium text-negative">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="plain" color="neutral" size="md" onClick={() => setOpen?.(false)}>
          Cancel
        </Button>
        <Button
          type="button"
          size="md"
          disabled={Boolean(error)}
          onClick={() => {
            form.setValue('mcpJson', value, { shouldDirty: true })
            setOpen?.(false)
          }}
        >
          Save configuration
        </Button>
      </div>
    </Section>
  )
}

export function AgenticWorkflowConfiguration() {
  const { environmentId = '', organizationId = '', projectId = '' } = useParams({ strict: false })
  const { data: mcpServers = [], isLoading: areMcpServersLoading } = useMcpServers({ organizationId })
  const navigate = useNavigate()
  const { closeModal, openModal } = useModal()
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
  const [providerModalOpen, setProviderModalOpen] = useState(false)
  const [activeSheet, setActiveSheet] = useState<'mcp' | 'automation' | null>(null)
  const [editingAutomationId, setEditingAutomationId] = useState<string | null>(null)
  const [createdMcpServers, setCreatedMcpServers] = useState<McpServerResponse[]>([])
  const [dockerModalOpen, setDockerModalOpen] = useState(false)
  const [mcpJsonModalOpen, setMcpJsonModalOpen] = useState(false)
  const [showValidationErrors, setShowValidationErrors] = useState(false)
  const modelApiKeyInputRef = useRef<HTMLInputElement>(null)
  const headerRef = useRef<AgenticWorkflowHeaderHandle>(null)
  const promptEditorRef = useRef<AgenticWorkflowPromptEditorHandle>(null)
  const createdServiceIdRef = useRef<string>()
  const values = form.watch()
  const { dirtyFields } = form.formState
  const mcpJsonError = getJsonError(values.mcpJson)
  const modelSettingsJsonError = getJsonError(values.modelSettingsJson, true)
  const gitRepositoriesValid = values.gitRepositories.every(isGitRepositoryComplete)
  const variableValues = variablesForm.watch('variables')
  const variablesValid = areVariablesValid(variableValues)
  const showNameError = (showValidationErrors || Boolean(dirtyFields.name)) && !values.name.trim()
  const showPromptError = (showValidationErrors || Boolean(dirtyFields.agentPrompt)) && !values.agentPrompt.trim()
  const showModelApiKeyError = (showValidationErrors || Boolean(dirtyFields.modelApiKey)) && !values.modelApiKey.trim()
  const providerConfigurationInvalid = !values.modelApiKey.trim() || Boolean(modelSettingsJsonError)
  const settingsGroupsInvalid: Record<SettingsGroup, boolean> = {
    general: false,
    resources: false,
    governance: false,
    variables: !variablesValid,
    advanced: Boolean(mcpJsonError),
  }
  const editingAutomation = values.automations.find((automation) => automation.id === editingAutomationId)
  const availableMcpServers = [...mcpServers, ...createdMcpServers].filter(
    (mcpServer, index, servers) => servers.findIndex(({ id }) => id === mcpServer.id) === index
  )
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

  const openAutomationSheet = (automationId?: string) => {
    setEditingAutomationId(automationId ?? null)
    setActiveSheet('automation')
  }

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
      headerRef.current?.focusName()
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

    if (!gitRepositoriesValid) {
      const invalidIndex = values.gitRepositories.findIndex((repository) => !isGitRepositoryComplete(repository))
      openGitContext(invalidIndex >= 0 ? invalidIndex : undefined)
      return false
    }

    const firstInvalidGroup = (['general', 'resources', 'variables', 'advanced'] as const).find(
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

      <SettingsAccordionItem value="governance" title="Governance" invalid={false}>
        <div className="flex flex-col gap-3">
          <p className="text-xs text-neutral-subtle">Control which external domains the agent task can access.</p>
          <InputTextArea
            name={`whitelist-hosts-${panel}`}
            label="Domain allowlist"
            value={values.whitelistHosts}
            hint="Use * to allow all domains, or enter hostnames separated by commas."
            onChange={(event) => form.setValue('whitelistHosts', event.currentTarget.value, { shouldDirty: true })}
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
                Advanced MCP configuration
              </Heading>
              <p className="mt-1 text-xs text-neutral-subtle">Configure additional MCP servers with JSON.</p>
            </div>
            {values.mcpJson ? (
              <div className="flex items-center gap-3 rounded-lg border border-neutral bg-surface-neutral p-3">
                <Icon iconName="file-lines" iconStyle="regular" className="shrink-0 text-[13px] text-neutral-subtle" />
                <span className="min-w-0 flex-1 truncate text-ssm leading-[18px] text-neutral">MCP configuration</span>
                <Button
                  type="button"
                  variant="outline"
                  color="neutral"
                  size="xs"
                  onClick={() => setMcpJsonModalOpen(true)}
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
                  aria-label="Delete MCP configuration"
                  onClick={() => form.setValue('mcpJson', '', { shouldDirty: true })}
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
                  onClick={() => setMcpJsonModalOpen(true)}
                >
                  <Icon iconName="code" iconStyle="regular" />
                  Add raw
                </Button>
              </div>
            )}
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
          <Section className="mx-auto flex max-w-[920px] flex-col px-6 py-8 sm:px-10 sm:py-10">
            <AgenticWorkflowHeader
              ref={headerRef}
              name={values.name}
              nameError={showNameError ? 'Please enter an agent task name.' : undefined}
              onNameChange={(value) => form.setValue('name', value, { shouldDirty: true })}
            />
            <section aria-label="Context" className="flex flex-col gap-2 py-6">
              <h2 className="text-sm font-medium text-neutral-subtle">Context</h2>
              {values.gitRepositories.some(isGitRepositoryComplete) ? (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {values.gitRepositories.map((repository, index) =>
                      isGitRepositoryComplete(repository) ? (
                        <GitContextCompactCard
                          key={`${repository.repository}-${index}`}
                          provider={repository.provider}
                          repository={repository.gitRepository?.name || repository.repository}
                          onClick={() => openGitContext(index)}
                        />
                      ) : null
                    )}
                  </div>
                  <div className="flex">
                    <Button type="button" variant="outline" color="neutral" size="sm" onClick={() => openGitContext()}>
                      <Icon iconName="circle-plus" iconStyle="regular" />
                      Add repository
                    </Button>
                  </div>
                </>
              ) : (
                <GitContextCard onClick={() => openGitContext()} />
              )}
            </section>
            <section aria-label="Agent task capabilities" className="border-t border-neutral py-3">
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
                      className="flex h-7 max-w-full items-center rounded border border-neutral bg-surface-neutral pl-2 pr-1 text-ssm font-medium text-neutral"
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
                <Button type="button" size="sm" color="neutral" variant="outline" onClick={() => setActiveSheet('mcp')}>
                  <Icon iconName="circle-plus" iconStyle="regular" />
                  Add MCP
                </Button>
              </ConfigurationRow>
              <ConfigurationRow label="Automations">
                {values.automations.map((automation) => (
                  <Button
                    key={automation.id}
                    type="button"
                    size="sm"
                    color="neutral"
                    variant="outline"
                    className="max-w-full"
                    onClick={() => openAutomationSheet(automation.id)}
                  >
                    <Icon iconName="bolt" iconStyle="regular" />
                    <span className="truncate">
                      {automation.name.trim() && automation.name.trim() !== 'New automation'
                        ? automation.name
                        : summarizeAutomation(automation)}
                    </span>
                  </Button>
                ))}
                <Button type="button" size="sm" color="neutral" variant="outline" onClick={() => openAutomationSheet()}>
                  <Icon iconName="circle-plus" iconStyle="regular" />
                  Add automation
                </Button>
              </ConfigurationRow>
            </section>
            <section aria-label="Instructions" className="border-t border-neutral pt-6">
              <AgenticWorkflowPromptEditor
                ref={promptEditorRef}
                environmentId={environmentId}
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
          className="hidden h-full w-[380px] shrink-0 overflow-y-auto border-l border-neutral bg-background-secondary lg:block"
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

      {providerModalOpen ? (
        <Modal externalOpen={providerModalOpen} setExternalOpen={setProviderModalOpen} width={520}>
          <ConfigurationModalContent
            title="Configure provider"
            description="Choose the AI provider and configure its credentials and cloud settings."
            confirmLabel="Save provider"
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

      {activeSheet === 'mcp' ? (
        <McpSheet
          isLoading={areMcpServersLoading}
          mcpServers={mcpServers}
          createdMcpServers={createdMcpServers}
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

      {activeSheet === 'automation' ? (
        <AutomationSheet
          automation={editingAutomation}
          onClose={() => setActiveSheet(null)}
          onRemove={
            editingAutomation
              ? () => {
                  form.setValue(
                    'automations',
                    values.automations.filter((automation) => automation.id !== editingAutomation.id),
                    { shouldDirty: true }
                  )
                  setActiveSheet(null)
                }
              : undefined
          }
          onSave={(automation) =>
            form.setValue(
              'automations',
              editingAutomation
                ? values.automations.map((item) => (item.id === automation.id ? automation : item))
                : [...values.automations, automation],
              { shouldDirty: true }
            )
          }
        />
      ) : null}

      {dockerModalOpen ? (
        <Modal externalOpen={dockerModalOpen} setExternalOpen={setDockerModalOpen} width={720}>
          <DockerFragmentModal setOpen={setDockerModalOpen} />
        </Modal>
      ) : null}

      {mcpJsonModalOpen ? (
        <Modal externalOpen={mcpJsonModalOpen} setExternalOpen={setMcpJsonModalOpen} width={720}>
          <McpJsonModal setOpen={setMcpJsonModalOpen} />
        </Modal>
      ) : null}
    </div>
  )
}
