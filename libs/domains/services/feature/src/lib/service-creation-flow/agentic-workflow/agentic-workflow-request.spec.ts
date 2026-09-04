import { AgenticWorkflowExecutionMode, AgenticWorkflowModelType } from 'qovery-typescript-axios'
import { type AgenticWorkflowFormData } from './agentic-workflow-context'
import { formatAgenticWorkflowRequest } from './agentic-workflow-request'

const values: AgenticWorkflowFormData = {
  name: 'Review pull requests',
  description: '',
  cpu: '2000',
  memory: '2048',
  storage: '10',
  executionMode: AgenticWorkflowExecutionMode.IN_PLACE,
  aiModel: AgenticWorkflowModelType.CLAUDE,
  mcpServerIds: ['mcp-1', 'mcp-2'],
  mcpJson: '',
  gitRepositories: [],
  modelApiKey: 'api-key',
  modelSettingsJson: '{}',
  whitelistHosts: '*',
  dockerFragment: '',
  automations: [],
  agentPrompt: 'Review the pull request',
}

describe('formatAgenticWorkflowRequest', () => {
  it('enables newly created agent tasks', () => {
    expect(formatAgenticWorkflowRequest(values).enabled).toBe(true)
  })

  it('sends the selected organization MCP server IDs', () => {
    expect(formatAgenticWorkflowRequest(values).mcp_server_ids).toEqual(['mcp-1', 'mcp-2'])
  })

  it('derives the schedule from an automation schedule trigger', () => {
    expect(formatAgenticWorkflowRequest(values).schedule).toBeNull()
    expect(
      formatAgenticWorkflowRequest({
        ...values,
        automations: [
          {
            id: 'automation-1',
            triggers: [{ id: 'trigger-1', type: 'schedule', cronExpression: '0 8 * * 1-5', timezone: 'Europe/Paris' }],
            outputs: [],
          },
        ],
      }).schedule
    ).toEqual({
      cron_expression: '0 8 * * 1-5',
      timezone: 'Europe/Paris',
    })
  })

  it('derives outputs from automation outputs', () => {
    const request = formatAgenticWorkflowRequest({
      ...values,
      automations: [
        {
          id: 'automation-1',
          triggers: [{ id: 'trigger-1', type: 'webhook' }],
          outputs: [{ url: 'https://hooks.example.com/workflow', headersJson: '{}', prompt: 'Notify the team.' }],
        },
      ],
    })

    expect(request.outputs).toEqual([
      {
        name: 'Output 1',
        url: 'https://hooks.example.com/workflow',
        headers: [],
        instructions: 'Notify the team.',
      },
    ])
  })

  it('ignores malformed output headers instead of throwing at submit time', () => {
    const request = formatAgenticWorkflowRequest({
      ...values,
      automations: [
        {
          id: 'automation-1',
          triggers: [{ id: 'trigger-1', type: 'webhook' }],
          outputs: [{ url: null, headersJson: '{invalid', prompt: '' }],
        },
      ],
    })

    expect(request.outputs?.[0]?.headers).toEqual([])
  })

  it('sends the selected execution mode', () => {
    expect(formatAgenticWorkflowRequest(values).execution_mode).toBe(AgenticWorkflowExecutionMode.IN_PLACE)
    expect(
      formatAgenticWorkflowRequest({
        ...values,
        executionMode: AgenticWorkflowExecutionMode.CLONE_ENVIRONMENT,
      }).execution_mode
    ).toBe(AgenticWorkflowExecutionMode.CLONE_ENVIRONMENT)
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
