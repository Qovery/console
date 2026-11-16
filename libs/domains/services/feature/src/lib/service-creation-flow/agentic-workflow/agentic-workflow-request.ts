import {
  AgenticWorkflowModelType,
  type AgenticWorkflowRequest,
  type LlmProviderResponse,
  LlmProviderType,
} from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { type AgenticWorkflowFormData } from './agentic-workflow-context'
import { parseAgenticWorkflowHeaders } from './agentic-workflow-headers'

const CONTEXT_SERVICES_START_MARKER = '<!-- qovery-context-services:start -->'
const CONTEXT_SERVICES_END_MARKER = '<!-- qovery-context-services:end -->'
const DELIMITED_CONTEXT_SERVICES_BLOCK_PATTERN =
  /\n\n<!-- qovery-context-services:start -->\n[\s\S]*?\n<!-- qovery-context-services:end -->/g
const LEGACY_CONTEXT_SERVICES_BLOCK_PATTERN =
  /\n\n## Context services\n(?:- [^\n]+ — service ID: [^\n]+\n)*(?:- [^\n]+ — service ID: [^\n]+)(?=\n\n|$)/g

const BEDROCK_HOSTS = ['bedrock-runtime.*.amazonaws.com', '51.45.40.194', '13.37.114.98', '15.188.250.162']
const CLAUDE_HOSTS = ['api.anthropic.com']

export type AgenticWorkflowLlmProvider = Pick<LlmProviderResponse, 'type' | 'base_url'>

function getBaseUrlHostname(baseUrl?: string | null) {
  if (!baseUrl) return undefined
  try {
    return new URL(baseUrl).hostname || undefined
  } catch {
    return undefined
  }
}

// The agent's egress is limited to the allowlist, including calls to its own model.
export function getLlmProviderHosts(
  provider: AgenticWorkflowLlmProvider | undefined,
  modelType: AgenticWorkflowModelType
): string[] {
  // Without the provider (list not loaded), fall back on the model type. A gateway cannot be resolved this way.
  if (!provider) return modelType === AgenticWorkflowModelType.BEDROCK ? BEDROCK_HOSTS : CLAUDE_HOSTS

  return match(provider.type)
    .with(LlmProviderType.CLAUDE, () => CLAUDE_HOSTS)
    .with(LlmProviderType.BEDROCK, () => BEDROCK_HOSTS)
    .with(LlmProviderType.ANTHROPIC_COMPATIBLE, () => {
      const hostname = getBaseUrlHostname(provider.base_url)
      return hostname ? [hostname] : []
    })
    .exhaustive()
}

export function addLlmProviderHosts(hosts: string[], llmProviderHosts: string[]): string[] {
  if (hosts.includes('*')) return hosts

  const known = new Set(hosts.map((host) => host.toLowerCase()))
  const missing = llmProviderHosts.filter((host) => !known.has(host.toLowerCase()))
  return [...hosts, ...missing]
}

export function parseHostAllowlist(value: string) {
  return value
    .split(',')
    .map((host) => host.trim())
    .filter(Boolean)
}

export function appendContextServicesToPrompt(
  prompt: string,
  contextServices: AgenticWorkflowFormData['contextServices']
) {
  if (contextServices.length === 0) return prompt

  const services = contextServices.map(({ id, name, type }) => `- ${name} (${type}) — service ID: ${id}`).join('\n')
  return `${prompt.trimEnd()}\n\n${CONTEXT_SERVICES_START_MARKER}\n## Context services\n${services}\n${CONTEXT_SERVICES_END_MARKER}`
}

export function replaceContextServicesInPrompt(
  prompt: string,
  contextServices: AgenticWorkflowFormData['contextServices']
) {
  const promptWithoutContextServices = prompt
    .replace(DELIMITED_CONTEXT_SERVICES_BLOCK_PATTERN, '')
    .replace(LEGACY_CONTEXT_SERVICES_BLOCK_PATTERN, '')
  return appendContextServicesToPrompt(promptWithoutContextServices, contextServices)
}

export function formatAgenticWorkflowRequest(
  values: AgenticWorkflowFormData,
  requiredMcpServerIds: string[] = [],
  llmProvider?: AgenticWorkflowLlmProvider
): AgenticWorkflowRequest {
  const scheduleTrigger = values.automations
    .flatMap((automation) => automation.triggers)
    .find((trigger) => trigger.type === 'schedule')
  const automationOutputs = values.automations.flatMap((automation) => automation.outputs)

  return {
    name: values.name,
    description: values.description,
    docker_fragment: values.dockerFragment,
    enabled: true,
    execution_mode: values.executionMode,
    schedule: scheduleTrigger
      ? {
          cron_expression: scheduleTrigger.cronExpression ?? '',
          timezone: scheduleTrigger.timezone ?? 'Etc/UTC',
        }
      : null,
    mcp: values.mcpJson.trim() || undefined,
    mcp_servers: values.mcpServerIds.map((id) => ({ id, required: requiredMcpServerIds.includes(id) })),
    context_service_ids: values.contextServices.map(({ id }) => id),
    outputs: automationOutputs.map((output, index) => ({
      name: output.name?.trim() || `Output ${index + 1}`,
      url: output.url,
      headers: parseAgenticWorkflowHeaders(output.headersJson),
      instructions: output.prompt,
    })),
    model: {
      type: values.aiModel,
      llm_provider_id: values.llmProviderId,
      settings: values.modelSettingsJson,
    },
    project_repositories: values.gitRepositories.map((repository) => ({
      url: repository.gitRepository?.url ?? repository.repository,
      branch: repository.branch,
      git_token_id: repository.gitTokenId ?? '',
    })),
    agent_prompt: replaceContextServicesInPrompt(values.agentPrompt, values.contextServices),
    governance: {
      host_allowlist: addLlmProviderHosts(
        parseHostAllowlist(values.whitelistHosts),
        getLlmProviderHosts(llmProvider, values.aiModel)
      ),
    },
    resources: {
      cpu_milli: Number(values.cpu),
      ram_mib: Number(values.memory),
      gpu: 0,
      storage_gib: Number(values.storage),
    },
  }
}
