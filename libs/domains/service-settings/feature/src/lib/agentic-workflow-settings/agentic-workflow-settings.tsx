import { useParams } from '@tanstack/react-router'
import equal from 'fast-deep-equal'
import {
  AgenticWorkflowExecutionMode,
  type AgenticWorkflowModelType,
  type AgenticWorkflowRequest,
  type GitTokenResponse,
} from 'qovery-typescript-axios'
import { useForm } from 'react-hook-form'
import { useGitTokens, useLlmProviders } from '@qovery/domains/organizations/feature'
import { isAgenticWorkflow } from '@qovery/domains/services/data-access'
import {
  type AgenticWorkflowAutomation,
  type AgenticWorkflowGitRepository,
  createAgenticWorkflowAutomation,
  formatAgenticWorkflowAutomationOutputs,
  isGitRepositoryComplete,
  replaceContextServicesInPrompt,
  useAgenticWorkflowContextServices,
  useEditService,
  useService,
} from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Button, Section } from '@qovery/shared/ui'
import { guessGitProvider } from '@qovery/shared/util-git'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { AgenticWorkflowAdvancedSettings } from './agentic-workflow-advanced-settings/agentic-workflow-advanced-settings'
import { AgenticWorkflowAiConfigurationSettings } from './agentic-workflow-ai-configuration-settings/agentic-workflow-ai-configuration-settings'
import { AgenticWorkflowAutomationsSettings } from './agentic-workflow-automations-settings/agentic-workflow-automations-settings'
import { AgenticWorkflowConnectionsSettings } from './agentic-workflow-connections-settings/agentic-workflow-connections-settings'
import { AgenticWorkflowGeneralSettings } from './agentic-workflow-general-settings/agentic-workflow-general-settings'
import { AgenticWorkflowGovernanceSettings } from './agentic-workflow-governance-settings/agentic-workflow-governance-settings'

export interface AgenticWorkflowSettingsFormValues {
  name: string
  description: string
  enabled: boolean
  executionMode: AgenticWorkflowExecutionMode
  llmProviderId: string
  modelSettings: string
  agentPrompt: string
  repositories: AgenticWorkflowGitRepository[]
  mcpServerIds: string[]
  requiredMcpServerIds: string[]
  contextServiceIds: string[]
  mcp: string
  dockerFragment: string
  automation: AgenticWorkflowAutomation
  hostAllowlist: string
  webhookIpAllowlist: string
  cpu: string
  ram: string
  gpu: string
  storage: string
}

export type SaveAgenticWorkflowSettings = (values: Partial<AgenticWorkflowSettingsFormValues>) => Promise<void>

export function hasAgenticWorkflowSettingsChanges(
  currentValues: AgenticWorkflowSettingsFormValues,
  updatedValues: Partial<AgenticWorkflowSettingsFormValues>
) {
  return Object.entries(updatedValues).some(
    ([key, value]) => !equal(currentValues[key as keyof AgenticWorkflowSettingsFormValues], value)
  )
}

type SettingsPage =
  | 'general'
  | 'ai-configuration'
  | 'connections'
  | 'automations'
  | 'outputs'
  | 'governance'
  | 'advanced-settings'

interface AgenticWorkflowSettingsProps {
  page: SettingsPage
}

const PAGE_CONTENT: Record<SettingsPage, { title: string; description: string }> = {
  general: {
    title: 'General settings',
    description: 'Configure the agent task identity, availability, and resources.',
  },
  'ai-configuration': {
    title: 'AI configuration',
    description: 'Configure the provider and instructions used by this agent task.',
  },
  connections: {
    title: 'Connections',
    description: 'Manage the Git repositories, MCP servers, and runtime configuration available to the agent task.',
  },
  automations: {
    title: 'Automations',
    description: 'Configure when the agent task runs.',
  },
  outputs: {
    title: 'Outputs',
    description: 'Configure where the agent task sends its results.',
  },
  governance: {
    title: 'Governance',
    description: 'Control the hosts and webhook source addresses allowed for this agent task.',
  },
  'advanced-settings': {
    title: 'Advanced settings',
    description: 'Configure optional runtime customization for this agent task.',
  },
}

export function getGitRepositoryName(url: string) {
  try {
    return new URL(url).pathname.replace(/^\//, '').replace(/\.git$/, '')
  } catch {
    return url.replace(/\.git$/, '')
  }
}

export function getGitRepositoryProvider(
  url: string,
  gitTokenId: string | null | undefined,
  gitTokens: GitTokenResponse[]
) {
  return gitTokens.find(({ id }) => id === gitTokenId)?.type ?? guessGitProvider(url)
}

export function formatAgenticWorkflowRepositories(repositories: AgenticWorkflowGitRepository[]) {
  return repositories.map(({ repository, gitRepository, branch, gitTokenId }) => ({
    url: gitRepository?.url ?? repository,
    branch,
    git_token_id: gitTokenId,
  }))
}

export function agenticWorkflowJsonValidation(value: string) {
  try {
    JSON.parse(value)
    return true
  } catch {
    return 'Invalid JSON format.'
  }
}

export function AgenticWorkflowSettings({ page }: AgenticWorkflowSettingsProps) {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })
  const { data: service } = useService({ environmentId, serviceId, suspense: true })
  const {
    data: contextServices = [],
    isError: contextServicesError,
    isLoading: contextServicesLoading,
  } = useAgenticWorkflowContextServices(environmentId)
  const { mutateAsync: editService, isLoading } = useEditService({ organizationId, projectId, environmentId })
  const { data: llmProviders = [] } = useLlmProviders({ organizationId, enabled: page === 'ai-configuration' })
  const content = PAGE_CONTENT[page]
  useDocumentTitle(`${content.title} - Service settings`)
  const workflow = service && isAgenticWorkflow(service) ? service : undefined
  const { data: gitTokens = [], isLoading: gitTokensLoading } = useGitTokens({
    organizationId,
    enabled: page === 'connections' && workflow?.project_repositories.some(({ git_token_id }) => git_token_id != null),
  })
  const form = useForm<AgenticWorkflowSettingsFormValues>({
    mode: 'onChange',
    values: workflow
      ? {
          name: workflow.name,
          description: workflow.description,
          enabled: workflow.enabled,
          executionMode: workflow.execution_mode ?? AgenticWorkflowExecutionMode.IN_PLACE,
          llmProviderId: workflow.model.llm_provider_id ?? '',
          modelSettings: workflow.model.settings,
          agentPrompt: workflow.agent_prompt,
          repositories: workflow.project_repositories.map(({ url, branch, git_token_id }) => {
            const name = getGitRepositoryName(url)
            return {
              provider: getGitRepositoryProvider(url, git_token_id, gitTokens),
              repository: name,
              branch,
              gitTokenId: git_token_id,
              isPublicRepository: !git_token_id,
              gitRepository: { id: url, name, url, default_branch: branch },
            }
          }),
          mcp: workflow.mcp,
          mcpServerIds: workflow.mcp_servers?.length
            ? workflow.mcp_servers.map(({ id }) => id)
            : workflow.mcp_server_ids ?? [],
          requiredMcpServerIds: workflow.mcp_servers?.filter(({ required }) => required).map(({ id }) => id) ?? [],
          contextServiceIds: workflow.context_service_ids ?? [],
          dockerFragment: workflow.docker_fragment,
          automation: createAgenticWorkflowAutomation(workflow.schedule, workflow.outputs),
          hostAllowlist: workflow.governance.host_allowlist.join(', '),
          webhookIpAllowlist: workflow.webhook_ip_allowlist.join(', '),
          cpu: String(workflow.resources.cpu_milli),
          ram: String(workflow.resources.ram_mib),
          gpu: String(workflow.resources.gpu),
          storage: String(workflow.resources.storage_gib),
        }
      : undefined,
    resetOptions: { keepDirtyValues: true },
  })

  if (!workflow) return null

  const values = form.watch()
  const pageValid =
    Boolean(values.name.trim()) &&
    (page !== 'ai-configuration' ||
      (Boolean(values.llmProviderId) &&
        Boolean(values.agentPrompt.trim()) &&
        agenticWorkflowJsonValidation(values.modelSettings) === true)) &&
    (page !== 'connections' || values.repositories.every(isGitRepositoryComplete))
  const persistSettings: SaveAgenticWorkflowSettings = async (updatedValues) => {
    const data = { ...form.getValues(), ...updatedValues }
    const schedule = data.automation.triggers.find((trigger) => trigger.type === 'schedule')
    const selectedProvider = llmProviders.find(({ id }) => id === data.llmProviderId)
    const model: AgenticWorkflowRequest['model'] = {
      // Keep the model type aligned with the selected token's provider (Claude, Bedrock, ...)
      type: (selectedProvider?.type as AgenticWorkflowModelType) ?? workflow.model.type,
      settings: data.modelSettings,
      llm_provider_id: data.llmProviderId,
    }
    const selectedContextServices = contextServices.filter(({ id }) => data.contextServiceIds.includes(id))
    const preserveContextServices = contextServicesError || contextServicesLoading
    const contextServiceIds = preserveContextServices
      ? data.contextServiceIds
      : selectedContextServices.map(({ id }) => id)
    const agentPrompt = preserveContextServices
      ? data.agentPrompt
      : replaceContextServicesInPrompt(data.agentPrompt, selectedContextServices)

    await editService({
      serviceId,
      payload: {
        serviceType: 'AGENTIC_WORKFLOW',
        name: data.name,
        description: data.description,
        enabled: data.enabled,
        execution_mode: data.executionMode,
        schedule: schedule
          ? { cron_expression: schedule.cronExpression ?? '', timezone: schedule.timezone ?? 'Etc/UTC' }
          : null,
        model,
        agent_prompt: agentPrompt,
        project_repositories: formatAgenticWorkflowRepositories(data.repositories),
        mcp: data.mcp,
        mcp_servers: data.mcpServerIds.map((id) => ({ id, required: data.requiredMcpServerIds.includes(id) })),
        context_service_ids: contextServiceIds,
        docker_fragment: data.dockerFragment,
        outputs: formatAgenticWorkflowAutomationOutputs(data.automation.outputs),
        governance: {
          host_allowlist: data.hostAllowlist
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),
        },
        webhook_ip_allowlist: data.webhookIpAllowlist
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
        resources: {
          cpu_milli: Number(data.cpu),
          ram_mib: Number(data.ram),
          gpu: Number(data.gpu),
          storage_gib: Number(data.storage),
        },
      },
    })
    form.reset({ ...data, agentPrompt, contextServiceIds })
  }
  const saveSettings: SaveAgenticWorkflowSettings = async (updatedValues) => {
    if (!hasAgenticWorkflowSettingsChanges(form.getValues(), updatedValues)) return
    await persistSettings(updatedValues)
  }
  const submit = form.handleSubmit(persistSettings)
  const hasOverlaySave = ['connections', 'automations', 'outputs', 'advanced-settings'].includes(page)

  return (
    <Section className="px-8 pb-8 pt-6">
      <SettingsHeading title={content.title} description={content.description} />
      <form onSubmit={submit} className="max-w-content-with-navigation-left space-y-4">
        {page === 'general' ? <AgenticWorkflowGeneralSettings form={form} /> : null}
        {page === 'ai-configuration' ? (
          <AgenticWorkflowAiConfigurationSettings
            form={form}
            llmProviders={llmProviders.filter(({ has_credential }) => has_credential)}
          />
        ) : null}
        {page === 'connections' ? (
          <AgenticWorkflowConnectionsSettings
            environmentId={environmentId}
            form={form}
            gitTokensLoading={gitTokensLoading}
            isSaving={isLoading}
            onSave={saveSettings}
          />
        ) : null}
        {page === 'automations' ? (
          <AgenticWorkflowAutomationsSettings form={form} section="triggers" onSave={saveSettings} />
        ) : null}
        {page === 'outputs' ? (
          <AgenticWorkflowAutomationsSettings form={form} section="outputs" onSave={saveSettings} />
        ) : null}
        {page === 'governance' ? <AgenticWorkflowGovernanceSettings form={form} /> : null}
        {page === 'advanced-settings' ? (
          <AgenticWorkflowAdvancedSettings form={form} isSaving={isLoading} onSave={saveSettings} />
        ) : null}
        {!hasOverlaySave ? (
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              size="lg"
              loading={isLoading}
              disabled={
                !form.formState.isDirty || !pageValid || (values.contextServiceIds.length > 0 && contextServicesLoading)
              }
            >
              Save
            </Button>
          </div>
        ) : null}
      </form>
    </Section>
  )
}
