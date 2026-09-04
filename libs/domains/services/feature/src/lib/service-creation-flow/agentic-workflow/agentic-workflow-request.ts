import { type AgenticWorkflowRequest } from 'qovery-typescript-axios'
import { type AgenticWorkflowFormData } from './agentic-workflow-context'
import { parseAgenticWorkflowHeaders } from './agentic-workflow-headers'

function formatWhitelistHosts(value: string) {
  return value
    .split(',')
    .map((host) => host.trim())
    .filter(Boolean)
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
    agent_prompt: values.agentPrompt,
    governance: {
      host_allowlist: formatWhitelistHosts(values.whitelistHosts),
    },
  }
}
