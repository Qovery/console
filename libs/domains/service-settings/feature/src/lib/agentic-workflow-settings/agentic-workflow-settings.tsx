import { useParams } from '@tanstack/react-router'
import { AgenticWorkflowModelType, type AgenticWorkflowRequest } from 'qovery-typescript-axios'
import { useForm } from 'react-hook-form'
import { isAgenticWorkflow } from '@qovery/domains/services/data-access'
import { useEditService, useService } from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Button, InputText, InputTextArea, InputToggle, Section } from '@qovery/shared/ui'
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
  repositories: string
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

export function agenticWorkflowJsonValidation(value: string) {
  try {
    JSON.parse(value)
    return true
  } catch {
    return 'Invalid JSON format.'
  }
}

export function agenticWorkflowRepositoriesValidation(value: string) {
  const jsonError = agenticWorkflowJsonValidation(value)
  if (jsonError !== true) return jsonError
  const repositories = parseJson<Array<{ url?: string; branch?: string }>>(value)
  return (
    (Array.isArray(repositories) && repositories.every(({ url, branch }) => url?.trim() && branch?.trim())) ||
    'Each repository must have a URL and a branch.'
  )
}

export function agenticWorkflowOutputsValidation(value: string) {
  const jsonError = agenticWorkflowJsonValidation(value)
  if (jsonError !== true) return jsonError
  const outputs = parseJson<Array<{ url?: string | null }>>(value)
  return (Array.isArray(outputs) && outputs.every(({ url }) => url?.trim())) || 'Each output webhook must have a URL.'
}

export function AgenticWorkflowSettings({ page }: AgenticWorkflowSettingsProps) {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })
  const { data: service } = useService({ environmentId, serviceId, suspense: true })
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
      repositories: formatJson(service && isAgenticWorkflow(service) ? service.project_repositories : []),
      mcp: service && isAgenticWorkflow(service) ? service.mcp : '',
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
  form.register('repositories', { validate: agenticWorkflowRepositoriesValidation })
  form.register('mcp', { validate: (value) => !value.trim() || agenticWorkflowJsonValidation(value) })
  form.register('outputs', { validate: agenticWorkflowOutputsValidation })

  if (!service || !isAgenticWorkflow(service)) return null

  const values = form.watch()
  const submit = form.handleSubmit((data) => {
    const model: AgenticWorkflowRequest['model'] = {
      type: AgenticWorkflowModelType.CLAUDE,
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
      project_repositories: parseJson(data.repositories),
      mcp: data.mcp,
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

  const jsonField = (name: 'modelSettings' | 'repositories' | 'mcp' | 'outputs', label: string, hint?: string) => (
    <InputTextArea
      name={name}
      label={label}
      value={values[name]}
      hint={hint}
      error={form.formState.errors[name]?.message}
      onChange={(event) => form.setValue(name, event.currentTarget.value, { shouldDirty: true, shouldValidate: true })}
    />
  )

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
            {jsonField('repositories', 'Git repositories JSON')}
            {jsonField('mcp', 'MCP JSON')}
            <InputTextArea
              name="docker-fragment"
              label="Dockerfile fragment"
              value={values.dockerFragment}
              onChange={(event) => form.setValue('dockerFragment', event.currentTarget.value, { shouldDirty: true })}
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
          <Button type="submit" size="lg" loading={isLoading} disabled={!form.formState.isDirty || !values.name.trim()}>
            Save
          </Button>
        </div>
      </form>
    </Section>
  )
}
