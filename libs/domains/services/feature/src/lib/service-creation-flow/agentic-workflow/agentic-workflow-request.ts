import { type AgenticWorkflowRequest } from 'qovery-typescript-axios'
import { type AgenticWorkflowFormData } from './agentic-workflow-context'
import { parseAgenticWorkflowHeaders } from './agentic-workflow-headers'

function formatWhitelistHosts(value: string) {
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
  return `${prompt.trimEnd()}\n\n## Context services\n${services}`
}

export function formatAgenticWorkflowRequest(values: AgenticWorkflowFormData): AgenticWorkflowRequest {
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
    mcp_server_ids: values.mcpServerIds,
    outputs: automationOutputs.map((output, index) => ({
      name: output.name?.trim() || `Output ${index + 1}`,
      url: output.url,
      headers: parseAgenticWorkflowHeaders(output.headersJson),
      instructions: output.prompt,
    })),
    model: {
      type: values.aiModel,
      api_key: values.modelApiKey,
      settings: values.modelSettingsJson,
    },
    project_repositories: values.gitRepositories.map((repository) => ({
      url: repository.gitRepository?.url ?? repository.repository,
      branch: repository.branch,
      git_token_id: repository.gitTokenId ?? '',
    })),
    agent_prompt: appendContextServicesToPrompt(values.agentPrompt, values.contextServices),
    governance: {
      host_allowlist: formatWhitelistHosts(values.whitelistHosts),
    },
    resources: {
      cpu_milli: Number(values.cpu),
      ram_mib: Number(values.memory),
      gpu: 0,
      storage_gib: Number(values.storage),
    },
  }
}
