import { AgenticWorkflowModelType } from 'qovery-typescript-axios'
import { type AgenticWorkflowFormData } from './agentic-workflow-context'
import { formatAgenticWorkflowRequest } from './agentic-workflow-request'

const values: AgenticWorkflowFormData = {
  name: 'Review pull requests',
  description: '',
  cpu: '2000',
  memory: '2048',
  storage: '10',
  workflowEnabled: true,
  aiModel: AgenticWorkflowModelType.CLAUDE,
  webhookEnabled: true,
  mcpServerIds: ['mcp-1', 'mcp-2'],
  mcpJson: '',
  gitRepositories: [],
  modelApiKey: 'api-key',
  modelSettingsJson: '{}',
  whitelistHosts: '*',
  dockerFragment: '',
  outputs: [],
  agentPrompt: 'Review the pull request',
}

describe('formatAgenticWorkflowRequest', () => {
  it('sends the selected organization MCP server IDs', () => {
    expect(formatAgenticWorkflowRequest(values).mcp_server_ids).toEqual(['mcp-1', 'mcp-2'])
  })

  it('uses the full URL of a selected Git repository', () => {
    const request = formatAgenticWorkflowRequest({
      ...values,
      gitRepositories: [
        {
          repository: 'Qovery/console',
          gitRepository: {
            id: 'repository-id',
            name: 'Qovery/console',
            url: 'https://github.com/Qovery/console.git',
          },
          branch: 'main',
          gitTokenId: 'token-id',
        },
      ],
    })

    expect(request.project_repositories).toEqual([
      {
        url: 'https://github.com/Qovery/console.git',
        branch: 'main',
        git_token_id: 'token-id',
      },
    ])
  })

  it('keeps a manually entered public repository URL', () => {
    const request = formatAgenticWorkflowRequest({
      ...values,
      gitRepositories: [
        {
          repository: 'https://github.com/Qovery/console.git',
          branch: 'main',
          isPublicRepository: true,
        },
      ],
    })

    expect(request.project_repositories?.[0]?.url).toBe('https://github.com/Qovery/console.git')
  })
})
