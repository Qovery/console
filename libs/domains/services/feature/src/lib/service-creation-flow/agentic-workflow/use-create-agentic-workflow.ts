import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type AgenticWorkflowHeader, AgenticWorkflowModel, type AgenticWorkflowRequest } from 'qovery-typescript-axios'
import { mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'
import { type AgenticWorkflowFormData } from './agentic-workflow-context'

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

function formatWhitelistHosts(value: string) {
  return value
    .split(',')
    .map((host) => host.trim())
    .filter(Boolean)
}

function formatOutputHeaders(authentication: string): AgenticWorkflowHeader[] {
  if (!authentication.trim()) {
    return []
  }

  return [{ name: 'Authorization', value: authentication.trim() }]
}

export function formatAgenticWorkflowRequest(values: AgenticWorkflowFormData): AgenticWorkflowRequest {
  return {
    name: values.name,
    description: values.description,
    whitelist_hosts: formatWhitelistHosts(values.whitelistHosts),
    model_settings: values.modelSettingsJson,
    docker_fragment: values.dockerFragment,
    enabled: values.workflowEnabled,
    mcp_connectors: values.connectors.map((connector) => ({
      name: connector.name,
      url: connector.url,
      headers: parseHeaders(connector.headersJson),
      instructions: connector.mcpServersJson,
    })),
    outputs: values.outputs.map((output) => ({
      name: output.name,
      url: output.type === 'Other' ? null : output.url,
      headers: output.type === 'Other' ? [] : formatOutputHeaders(output.authentication),
      instructions: output.prompt,
    })),
    model: values.aiModel === 'Claude' ? AgenticWorkflowModel.CLAUDE : AgenticWorkflowModel.BEDROCK,
    project_repositories: values.gitRepositories.map((repository) => ({
      url: repository.repository,
      branch: repository.branch,
      root_path: '',
      git_token_id: repository.gitTokenId ?? '',
    })),
  }
}

export function useCreateAgenticWorkflow({ environmentId }: { environmentId: string }) {
  const queryClient = useQueryClient()

  return useMutation(mutations.createAgenticWorkflow, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.services.list(environmentId).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your agentic workflow has been created',
      },
      notifyOnError: true,
    },
  })
}
