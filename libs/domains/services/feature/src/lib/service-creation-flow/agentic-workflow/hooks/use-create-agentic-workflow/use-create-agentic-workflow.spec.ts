import { AgenticWorkflowModel } from 'qovery-typescript-axios'
import { type AgenticWorkflowFormData } from '../../agentic-workflow-context'
import { formatAgenticWorkflowRequest } from './use-create-agentic-workflow'

const formValues: AgenticWorkflowFormData = {
  name: 'review-agent',
  description: 'Reviews incoming changes',
  cpu: '2000',
  memory: '2048',
  storage: '10',
  workflowEnabled: false,
  aiModel: 'Claude',
  webhookEnabled: true,
  connectors: [
    {
      mcpServersJson: '{"mcpServers":{"github":{"type":"http","url":"https://api.githubcopilot.com/mcp/"}}}',
    },
  ],
  gitRepositories: [
    {
      provider: 'GITHUB',
      gitTokenId: 'token-1',
      gitTokenName: 'GitHub',
      repository: 'https://github.com/qovery/console',
      branch: 'main',
      rootPath: '/apps/console',
    },
  ],
  modelApiKey: 'sk-ant-test',
  modelSettingsJson: '{"provider":"anthropic","models":[{"name":"claude-sonnet-4"}]}',
  whitelistHosts: 'api.github.com, jira.company.com',
  dockerFragment: 'RUN npm install -g @modelcontextprotocol/server-github',
  outputs: [
    {
      url: 'https://hooks.slack.com/services/team/channel/token',
      headersJson: '{"Authorization":"Bearer {{SLACK_TOKEN}}","Ignored":42}',
      prompt: 'Send a summary.',
    },
  ],
  agentPrompt: 'Review the payload and open a PR when needed.',
}

describe('formatAgenticWorkflowRequest', () => {
  it('should map the creation form to the API payload', () => {
    expect(formatAgenticWorkflowRequest(formValues)).toEqual({
      name: 'review-agent',
      description: 'Reviews incoming changes',
      whitelist_hosts: ['api.github.com', 'jira.company.com'],
      model_settings: '{"provider":"anthropic","models":[{"name":"claude-sonnet-4"}]}',
      docker_fragment: 'RUN npm install -g @modelcontextprotocol/server-github',
      enabled: false,
      mcp_connectors: [
        {
          name: 'MCP 1',
          url: '',
          headers: [],
          instructions: '{"mcpServers":{"github":{"type":"http","url":"https://api.githubcopilot.com/mcp/"}}}',
        },
      ],
      outputs: [
        {
          name: 'Output 1',
          url: 'https://hooks.slack.com/services/team/channel/token',
          headers: [{ name: 'Authorization', value: 'Bearer {{SLACK_TOKEN}}' }],
          instructions: 'Send a summary.',
        },
      ],
      model: AgenticWorkflowModel.CLAUDE,
      project_repositories: [
        {
          url: 'https://github.com/qovery/console',
          branch: 'main',
          root_path: '/apps/console',
          git_token_id: 'token-1',
        },
      ],
    })
  })

  it('should fallback to the repository root path and Bedrock model when selected', () => {
    expect(
      formatAgenticWorkflowRequest({
        ...formValues,
        aiModel: 'Bedrock',
        whitelistHosts: ' * ',
        outputs: [{ url: 'https://example.com/webhook', headersJson: '', prompt: '' }],
        gitRepositories: [{ ...formValues.gitRepositories[0], rootPath: '' }],
      })
    ).toMatchObject({
      whitelist_hosts: ['*'],
      model: AgenticWorkflowModel.BEDROCK,
      outputs: [{ headers: [] }],
      project_repositories: [{ root_path: '/' }],
    })
  })
})
