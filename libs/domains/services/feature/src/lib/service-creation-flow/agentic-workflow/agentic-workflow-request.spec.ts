import { AgenticWorkflowExecutionMode, AgenticWorkflowModelType } from 'qovery-typescript-axios'
import { type AgenticWorkflowFormData } from './agentic-workflow-context'
import { formatAgenticWorkflowRequest, replaceContextServicesInPrompt } from './agentic-workflow-request'

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
  contextServices: [],
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

  it('sends selected MCP servers and their creation requirements', () => {
    expect(formatAgenticWorkflowRequest(values, ['mcp-1']).mcp_servers).toEqual([
      { id: 'mcp-1', required: true },
      { id: 'mcp-2', required: false },
    ])
  })

  it('sends the resources selected in the creation flow', () => {
    expect(formatAgenticWorkflowRequest(values).resources).toEqual({
      cpu_milli: 2000,
      ram_mib: 2048,
      gpu: 0,
      storage_gib: 10,
    })
    expect(formatAgenticWorkflowRequest({ ...values, cpu: '200', memory: '256', storage: '5' }).resources).toEqual({
      cpu_milli: 200,
      ram_mib: 256,
      gpu: 0,
      storage_gib: 5,
    })
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

  it('appends selected Qovery services to the agent prompt', () => {
    const request = formatAgenticWorkflowRequest({
      ...values,
      agentPrompt: 'Investigate the incident.\n',
      contextServices: [
        { id: 'application-1', name: 'api', type: 'APPLICATION' },
        { id: 'database-1', name: 'postgres', type: 'DATABASE' },
      ],
    })

    expect(request.agent_prompt).toBe(`Investigate the incident.

## Context services
- api (APPLICATION) — service ID: application-1
- postgres (DATABASE) — service ID: database-1`)
    expect(request.context_service_ids).toEqual(['application-1', 'database-1'])
  })

  it('keeps the agent prompt unchanged when no Qovery service is selected', () => {
    expect(formatAgenticWorkflowRequest(values).agent_prompt).toBe('Review the pull request')
  })

  it('replaces generated Qovery service context in an existing prompt', () => {
    expect(
      replaceContextServicesInPrompt(
        'Investigate.\n\n## Context services\n- old-api (APPLICATION) — service ID: old-service',
        [{ id: 'service-1', name: 'api', type: 'APPLICATION' }]
      )
    ).toBe('Investigate.\n\n## Context services\n- api (APPLICATION) — service ID: service-1')
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
