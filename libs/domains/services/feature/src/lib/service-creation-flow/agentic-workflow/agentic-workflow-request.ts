import { type AgenticWorkflowHeader, type AgenticWorkflowRequest } from 'qovery-typescript-axios'
import { type AgenticWorkflowFormData } from './agentic-workflow-context'

function formatWhitelistHosts(value: string) {
  return value
    .split(',')
    .map((host) => host.trim())
    .filter(Boolean)
}

function parseHeaders(headersJson: string): AgenticWorkflowHeader[] {
  if (!headersJson.trim()) {
    return []
  }

  const parsedValue = JSON.parse(headersJson)

  if (!parsedValue || typeof parsedValue !== 'object' || Array.isArray(parsedValue)) {
    return []
  }

  return Object.entries(parsedValue)
    .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
    .map(([name, value]) => ({ name, value }))
}

function parseResourceValue(value: string) {
  const parsedValue = Number.parseInt(value, 10)

  return Number.isFinite(parsedValue) ? parsedValue : 0
}

export function formatAgenticWorkflowRequest(values: AgenticWorkflowFormData): AgenticWorkflowRequest {
  return {
    name: values.name,
    description: values.description,
    docker_fragment: values.dockerFragment,
    enabled: values.workflowEnabled,
    mcp: values.mcpJson.trim() || undefined,
    outputs: values.outputs.map((output, index) => ({
      name: `Output ${index + 1}`,
      url: output.url,
      headers: parseHeaders(output.headersJson),
      instructions: output.prompt,
    })),
    model: {
      type: values.aiModel,
      api_key: values.modelApiKey,
      settings: values.modelSettingsJson,
    },
    project_repositories: values.gitRepositories.map((repository) => ({
      url: repository.repository,
      branch: repository.branch,
      git_token_id: repository.gitTokenId ?? '',
    })),
    agent_prompt: values.agentPrompt,
    governance: {
      host_allowlist: formatWhitelistHosts(values.whitelistHosts),
    },
    resources: {
      cpu_milli: parseResourceValue(values.cpu),
      ram_mib: parseResourceValue(values.memory),
      gpu: 0,
      storage_gib: parseResourceValue(values.storage),
    },
  }
}
