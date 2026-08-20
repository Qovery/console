import { useParams } from '@tanstack/react-router'
import { type AgenticWorkflowOutput, type AgenticWorkflowRequest } from 'qovery-typescript-axios'
import { useForm } from 'react-hook-form'
import { McpServerSetting, useGitTokens, useMcpServers } from '@qovery/domains/organizations/feature'
import { isAgenticWorkflow } from '@qovery/domains/services/data-access'
import {
  AgenticWorkflowCodeEditorField,
  type AgenticWorkflowGitRepository,
  GitRepositoryCard,
  isGitRepositoryComplete,
  useEditService,
  useService,
} from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Button, Heading, Icon, InputText, InputTextArea, InputToggle, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

type SettingsPage = 'general' | 'ai-configuration' | 'connections' | 'outputs' | 'governance'

interface AgenticWorkflowSettingsProps {
  page: SettingsPage
}

interface FormValues {
  name: string
  description: string
  enabled: boolean
  modelApiKey: string
  modelSettings: string
  agentPrompt: string
  repositories: AgenticWorkflowGitRepository[]
  mcpServerIds: string[]
  mcp: string
  dockerFragment: string
  outputs: string
  hostAllowlist: string
  webhookIpAllowlist: string
  cpu: string
  ram: string
  gpu: string
  storage: string
}

const PAGE_CONTENT: Record<SettingsPage, { title: string; description: string }> = {
  general: { title: 'General settings', description: 'Configure the workflow name, description, and availability.' },
  'ai-configuration': {
    title: 'AI configuration',
    description: 'Configure the model and instructions used by this workflow.',
  },
  connections: {
    title: 'Connections',
    description: 'Configure the Git repositories, MCP servers, and Dockerfile fragment available to the workflow.',
  },
  outputs: { title: 'Outputs', description: 'Configure the webhooks called when the workflow produces an output.' },
  governance: {
    title: 'Governance',
    description: 'Control the hosts and webhook source addresses allowed for this workflow.',
  },
}

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2)
}

function parseJson<T>(value: string): T {
  return JSON.parse(value) as T
}

export function getGitRepositoryName(url: string) {
  try {
    const pathname = new URL(url).pathname
    return pathname.replace(/^\//, '').replace(/\.git$/, '')
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
  const { data: gitTokens = [] } = useGitTokens({ organizationId, enabled: page === 'connections' })
  const { data: mcpServers = [], isLoading: areMcpServersLoading } = useMcpServers({
    organizationId,
    enabled: page === 'connections',
  })
  const { mutate: editService, isLoading } = useEditService({ organizationId, projectId, environmentId })
  const content = PAGE_CONTENT[page]
  useDocumentTitle(`${content.title} - Service settings`)

  const form = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      name: service?.name ?? '',
      description: service && isAgenticWorkflow(service) ? service.description : '',
      enabled: service && isAgenticWorkflow(service) ? service.enabled : false,
      modelApiKey: '',
      modelSettings: service && isAgenticWorkflow(service) ? service.model.settings : '',
      agentPrompt: service && isAgenticWorkflow(service) ? service.agent_prompt : '',
      repositories:
        service && isAgenticWorkflow(service)
          ? service.project_repositories.map(({ url, branch, git_token_id }) => {
              const name = getGitRepositoryName(url)
              return {
                repository: name,
                branch,
                gitTokenId: git_token_id,
                isPublicRepository: !git_token_id,
                gitRepository: {
                  id: url,
                  name,
                  url,
                  default_branch: branch,
                },
              }
            })
          : [],
      mcp: service && isAgenticWorkflow(service) ? service.mcp : '',
      mcpServerIds: service && isAgenticWorkflow(service) ? service.mcp_server_ids : [],
      dockerFragment: service && isAgenticWorkflow(service) ? service.docker_fragment : '',
      outputs: formatJson(service && isAgenticWorkflow(service) ? service.outputs : []),
      hostAllowlist: service && isAgenticWorkflow(service) ? service.governance.host_allowlist.join(', ') : '',
      webhookIpAllowlist: service && isAgenticWorkflow(service) ? service.webhook_ip_allowlist.join(', ') : '',
      cpu: String(service && isAgenticWorkflow(service) ? service.resources.cpu_milli : 0),
      ram: String(service && isAgenticWorkflow(service) ? service.resources.ram_mib : 0),
      gpu: String(service && isAgenticWorkflow(service) ? service.resources.gpu : 0),
      storage: String(service && isAgenticWorkflow(service) ? service.resources.storage_gib : 0),
    },
  })
  form.register('modelSettings', { validate: agenticWorkflowJsonValidation })
  form.register('mcp', { validate: (value) => !value.trim() || agenticWorkflowJsonValidation(value) })
  form.register('outputs', { validate: agenticWorkflowOutputsValidation })

  if (!service || !isAgenticWorkflow(service)) return null

  const values = form.watch()
  const submit = form.handleSubmit((data) => {
    const model: AgenticWorkflowRequest['model'] = {
      type: service.model.type,
      settings: data.modelSettings,
      ...(data.modelApiKey.trim() ? { api_key: data.modelApiKey.trim() } : {}),
    }
    const payload: AgenticWorkflowRequest & { serviceType: 'AGENTIC_WORKFLOW' } = {
      serviceType: 'AGENTIC_WORKFLOW',
      name: data.name,
      description: data.description,
      enabled: data.enabled,
      model,
      agent_prompt: data.agentPrompt,
      project_repositories: formatAgenticWorkflowRepositories(data.repositories),
      mcp: data.mcp,
      mcp_server_ids: data.mcpServerIds,
      docker_fragment: data.dockerFragment,
      outputs: parseJson(data.outputs),
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
    }
    editService({ serviceId, payload })
  })

  const jsonField = (name: 'modelSettings' | 'mcp' | 'outputs', label: string, hint?: string) => (
    <AgenticWorkflowCodeEditorField
      name={name}
      label={label}
      language="json"
      value={values[name]}
      hint={hint}
      error={form.formState.errors[name]?.message}
      onChange={(value) => form.setValue(name, value, { shouldDirty: true, shouldValidate: true })}
    />
  )

  const repositoriesValid = values.repositories.every(isGitRepositoryComplete)
  const pageValid =
    page === 'ai-configuration'
      ? agenticWorkflowJsonValidation(values.modelSettings) === true
      : page === 'connections'
        ? repositoriesValid && (!values.mcp.trim() || agenticWorkflowJsonValidation(values.mcp) === true)
        : page === 'outputs'
          ? agenticWorkflowOutputsValidation(values.outputs) === true
          : true
  const addRepository = () =>
    form.setValue('repositories', [...values.repositories, { repository: '', branch: '' }], { shouldDirty: true })

  return (
    <Section className="px-8 pb-8 pt-6">
      <SettingsHeading title={content.title} description={content.description} />
      <form onSubmit={submit} className="max-w-content-with-navigation-left space-y-4">
        {page === 'general' && (
          <>
            <InputText
              name="name"
              label="Name"
              value={values.name}
              error={!values.name.trim() ? 'Please enter a workflow name.' : undefined}
              onChange={(event) => form.setValue('name', event.currentTarget.value, { shouldDirty: true })}
            />
            <InputTextArea
              name="description"
              label="Description"
              value={values.description}
              onChange={(event) => form.setValue('description', event.currentTarget.value, { shouldDirty: true })}
            />
            <InputToggle
              small
              align="top"
              value={values.enabled}
              title="Enable workflow"
              description="Allow this workflow to listen for and process incoming requests."
              onChange={(value) => form.setValue('enabled', value, { shouldDirty: true })}
            />
            <div className="pt-6">
              <h2 className="mb-1 text-base font-medium text-neutral">Resources</h2>
              <p className="mb-4 text-sm text-neutral-subtle">
                Configure the compute resources allocated to the workflow.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {(['cpu', 'ram', 'gpu', 'storage'] as const).map((name) => (
                  <InputText
                    key={name}
                    name={name}
                    type="number"
                    label={{ cpu: 'CPU (mCPU)', ram: 'Memory (MiB)', gpu: 'GPU', storage: 'Storage (GiB)' }[name]}
                    value={values[name]}
                    onChange={(event) => form.setValue(name, event.currentTarget.value, { shouldDirty: true })}
                  />
                ))}
              </div>
            </div>
          </>
        )}
        {page === 'ai-configuration' && (
          <>
            <InputText
              name="model-api-key"
              type="password"
              label="API key"
              hint="Leave empty to keep the current API key."
              value={values.modelApiKey}
              onChange={(event) => form.setValue('modelApiKey', event.currentTarget.value, { shouldDirty: true })}
            />
            {jsonField('modelSettings', 'Model settings JSON')}
            <InputTextArea
              name="agent-prompt"
              label="Agent prompt"
              value={values.agentPrompt}
              onChange={(event) => form.setValue('agentPrompt', event.currentTarget.value, { shouldDirty: true })}
            />
          </>
        )}
        {page === 'connections' && (
          <>
            <div className="flex items-center justify-between pt-2">
              <div>
                <h2 className="text-base font-medium text-neutral">Git repositories</h2>
                <p className="mt-1 text-sm text-neutral-subtle">
                  Select the repositories and branches the workflow can access.
                </p>
              </div>
              <Button type="button" variant="outline" color="neutral" size="sm" onClick={addRepository}>
                <Icon iconName="plus" />
                Add repository
              </Button>
            </div>
            {values.repositories.map((repository, index) => (
              <GitRepositoryCard
                key={`${index}-${repository.provider ?? gitTokens.find(({ id }) => id === repository.gitTokenId)?.type ?? ''}`}
                index={index}
                repository={{
                  ...repository,
                  provider: repository.provider ?? gitTokens.find(({ id }) => id === repository.gitTokenId)?.type,
                }}
                onChange={(nextRepository) => {
                  const repositories = [...values.repositories]
                  repositories[index] = nextRepository
                  form.setValue('repositories', repositories, { shouldDirty: true })
                }}
                onRemove={() =>
                  form.setValue(
                    'repositories',
                    values.repositories.filter((_, repositoryIndex) => repositoryIndex !== index),
                    { shouldDirty: true }
                  )
                }
              />
            ))}
            {!repositoriesValid && (
              <p className="px-3 text-xs font-medium text-negative">
                Select a Git account, repository, and branch for each repository.
              </p>
            )}
            <McpServerSetting
              isLoading={areMcpServersLoading}
              mcpServers={mcpServers}
              organizationId={organizationId}
              value={values.mcpServerIds}
              onChange={(value) => form.setValue('mcpServerIds', value as string[], { shouldDirty: true })}
            />
            <Heading level={3} className="pt-4" weight="medium">
              Advanced MCP configuration
            </Heading>
            {jsonField('mcp', 'MCP JSON')}
            <AgenticWorkflowCodeEditorField
              name="docker-fragment"
              label="Dockerfile fragment"
              language="dockerfile"
              value={values.dockerFragment}
              onChange={(value) => form.setValue('dockerFragment', value, { shouldDirty: true })}
            />
          </>
        )}
        {page === 'outputs' && jsonField('outputs', 'Output webhooks JSON')}
        {page === 'governance' && (
          <>
            <InputTextArea
              name="host-allowlist"
              label="Domain allowlist"
              hint="Enter hostnames separated by commas. Use * to allow all domains."
              value={values.hostAllowlist}
              onChange={(event) => form.setValue('hostAllowlist', event.currentTarget.value, { shouldDirty: true })}
            />
            <InputTextArea
              name="webhook-ip-allowlist"
              label="Webhook IP allowlist"
              hint="Enter CIDR ranges separated by commas."
              value={values.webhookIpAllowlist}
              onChange={(event) =>
                form.setValue('webhookIpAllowlist', event.currentTarget.value, { shouldDirty: true })
              }
            />
          </>
        )}
        <div className="flex justify-end pt-6">
          <Button
            type="submit"
            size="lg"
            loading={isLoading}
            disabled={!form.formState.isDirty || !values.name.trim() || !pageValid}
          >
            Save
          </Button>
        </div>
      </form>
    </Section>
  )
}
