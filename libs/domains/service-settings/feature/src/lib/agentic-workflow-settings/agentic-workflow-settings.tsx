import { useParams } from '@tanstack/react-router'
import {
  AgenticWorkflowExecutionMode,
  type AgenticWorkflowOutput,
  type AgenticWorkflowRequest,
} from 'qovery-typescript-axios'
import { useForm } from 'react-hook-form'
import { isAgenticWorkflow } from '@qovery/domains/services/data-access'
import {
  type AgenticWorkflowAutomation,
  type AgenticWorkflowGitRepository,
  createAgenticWorkflowAutomation,
  formatAgenticWorkflowAutomationOutputs,
  isGitRepositoryComplete,
  useEditService,
  useService,
} from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Button, Section } from '@qovery/shared/ui'
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
  modelApiKey: string
  modelSettings: string
  agentPrompt: string
  repositories: AgenticWorkflowGitRepository[]
  mcpServerIds: string[]
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

type SettingsPage = 'general' | 'ai-configuration' | 'connections' | 'automations' | 'governance' | 'advanced-settings'

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
    description: 'Configure when the agent task runs and where it sends its results.',
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

function parseJson<T>(value: string): T {
  return JSON.parse(value) as T
}

export function getGitRepositoryName(url: string) {
  try {
    return new URL(url).pathname.replace(/^\//, '').replace(/\.git$/, '')
  } catch {
    return url.replace(/\.git$/, '')
  }
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

export function agenticWorkflowOutputsValidation(value: string) {
  const jsonError = agenticWorkflowJsonValidation(value)
  if (jsonError !== true) return jsonError
  const outputs = parseJson<unknown>(value)
  return (
    (Array.isArray(outputs) &&
      outputs.every(
        (output): output is AgenticWorkflowOutput =>
          typeof output === 'object' &&
          output !== null &&
          'name' in output &&
          typeof output.name === 'string' &&
          Boolean(output.name.trim()) &&
          (!('url' in output) || output.url === null || (typeof output.url === 'string' && Boolean(output.url.trim())))
      )) ||
    'Each output must have a name and, when provided, a valid webhook URL.'
  )
}

export function AgenticWorkflowSettings({ page }: AgenticWorkflowSettingsProps) {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })
  const { data: service } = useService({ environmentId, serviceId, suspense: true })
  const { mutate: editService, isLoading } = useEditService({ organizationId, projectId, environmentId })
  const content = PAGE_CONTENT[page]
  useDocumentTitle(`${content.title} - Service settings`)
  const workflow = service && isAgenticWorkflow(service) ? service : undefined
  const form = useForm<AgenticWorkflowSettingsFormValues>({
    mode: 'onChange',
    values: workflow
      ? {
          name: workflow.name,
          description: workflow.description,
          enabled: workflow.enabled,
          executionMode: workflow.execution_mode ?? AgenticWorkflowExecutionMode.IN_PLACE,
          modelApiKey: '',
          modelSettings: workflow.model.settings,
          agentPrompt: workflow.agent_prompt,
          repositories: workflow.project_repositories.map(({ url, branch, git_token_id }) => {
            const name = getGitRepositoryName(url)
            return {
              repository: name,
              branch,
              gitTokenId: git_token_id,
              isPublicRepository: !git_token_id,
              gitRepository: { id: url, name, url, default_branch: branch },
            }
          }),
          mcp: workflow.mcp,
          mcpServerIds: workflow.mcp_server_ids,
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
  const schedule = values.automation.triggers.find((trigger) => trigger.type === 'schedule')
  const pageValid =
    Boolean(values.name.trim()) &&
    (page !== 'ai-configuration' || agenticWorkflowJsonValidation(values.modelSettings) === true) &&
    (page !== 'connections' ||
      (values.repositories.every(isGitRepositoryComplete) &&
        (!values.mcp.trim() || agenticWorkflowJsonValidation(values.mcp) === true)))
  const submit = form.handleSubmit((data) => {
    const model: AgenticWorkflowRequest['model'] = {
      type: workflow.model.type,
      settings: data.modelSettings,
      ...(data.modelApiKey.trim() ? { api_key: data.modelApiKey.trim() } : {}),
    }

    editService({
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
        agent_prompt: data.agentPrompt,
        project_repositories: formatAgenticWorkflowRepositories(data.repositories),
        mcp: data.mcp,
        mcp_server_ids: data.mcpServerIds,
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
  })

  return (
    <Section className="px-8 pb-8 pt-6">
      <SettingsHeading title={content.title} description={content.description} />
      <form onSubmit={submit} className="max-w-content-with-navigation-left space-y-4">
        {page === 'general' ? <AgenticWorkflowGeneralSettings form={form} /> : null}
        {page === 'ai-configuration' ? (
          <AgenticWorkflowAiConfigurationSettings environmentId={environmentId} form={form} />
        ) : null}
        {page === 'connections' ? <AgenticWorkflowConnectionsSettings form={form} /> : null}
        {page === 'automations' ? <AgenticWorkflowAutomationsSettings form={form} /> : null}
        {page === 'governance' ? <AgenticWorkflowGovernanceSettings form={form} /> : null}
        {page === 'advanced-settings' ? <AgenticWorkflowAdvancedSettings form={form} /> : null}
        <div className="flex justify-end pt-2">
          <Button type="submit" size="lg" loading={isLoading} disabled={!form.formState.isDirty || !pageValid}>
            Save
          </Button>
        </div>
      </form>
    </Section>
  )
}
