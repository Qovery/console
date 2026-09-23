import { AgenticWorkflowExecutionMode } from 'qovery-typescript-axios'
import { AGENTIC_WORKFLOW_TEMPLATES, getAgenticWorkflowTemplate } from './agentic-workflow-templates'

describe('agentic-workflow-templates', () => {
  it.each([
    ['incident-io-analyzer', 'INCIDENT_IO_API_KEY'],
    ['honeybadger-incident-analyzer', 'HONEYBADGER_API_TOKEN'],
  ])('preconfigures the %s incident analyzer', (id, credential) => {
    const template = getAgenticWorkflowTemplate(id)

    expect(template?.logoPath).toBeTruthy()
    expect(template?.seed.executionMode).toBe(AgenticWorkflowExecutionMode.CLONE_ENVIRONMENT)
    expect(template?.seed.agentPrompt).toContain(credential)
    expect(template?.seed.automations).toEqual([
      expect.objectContaining({ triggers: [expect.objectContaining({ type: 'webhook' })] }),
    ])
    expect(template?.variables?.map((variable) => variable.variable)).toContain(credential)
  })

  it('configures Jira Cloud Basic authentication and tenant access', () => {
    const template = getAgenticWorkflowTemplate('jira-coding-agent')

    expect(template?.seed.agentPrompt).toContain('JIRA_EMAIL')
    expect(template?.seed.agentPrompt).toContain('HTTP Basic auth')
    expect(template?.seed.whitelistHosts?.split(',')).toContain('*.atlassian.net')
    expect(template?.variables?.map((variable) => variable.variable)).toEqual([
      'JIRA_BASE_URL',
      'JIRA_EMAIL',
      'JIRA_API_TOKEN',
    ])
  })

  it.each(['jira-coding-agent', 'linear-coding-agent'])('allows the %s to reach the Bitbucket API', (id) => {
    expect(getAgenticWorkflowTemplate(id)?.seed.whitelistHosts?.split(',')).toContain('api.bitbucket.org')
  })

  it.each(['jira-coding-agent', 'linear-coding-agent'])('prevents duplicate processing in the %s prompt', (id) => {
    const prompt = getAgenticWorkflowTemplate(id)?.seed.agentPrompt

    expect(prompt).toContain('check the current issue status')
    expect(prompt).toContain('whether it has already been processed')
    expect(prompt).toContain('Do not perform the same job twice')
  })

  it.each(['jira-coding-agent', 'linear-coding-agent'])('preconfigures a webhook for the %s', (id) => {
    const template = getAgenticWorkflowTemplate(id)

    expect(template?.seed.executionMode).toBe(AgenticWorkflowExecutionMode.CLONE_ENVIRONMENT)
    expect(template?.seed.automations).toEqual([
      expect.objectContaining({ triggers: [expect.objectContaining({ type: 'webhook' })] }),
    ])
  })

  it.each([
    ['jira-coding-agent', 'Jira Coding Agent', 'JIRA_API_TOKEN'],
    ['linear-coding-agent', 'Linear Coding Agent', 'LINEAR_API_KEY'],
  ])('exposes the %s template', (id, title, credential) => {
    const template = getAgenticWorkflowTemplate(id)

    expect(template?.title).toBe(title)
    expect(template?.logoPath).toBeTruthy()
    expect(template?.seed.agentPrompt).toContain(credential)
    expect(template?.variables?.map((variable) => variable.variable)).toContain(credential)
  })

  it('provides theme-specific Linear logos', () => {
    const template = getAgenticWorkflowTemplate('linear-coding-agent')

    expect(template?.logoPath).toBe('/assets/agent-templates/linear-dark.svg')
    expect(template?.darkLogoPath).toBe('/assets/agent-templates/linear-light.svg')
  })

  it.each(['incident-io-analyzer', 'honeybadger-incident-analyzer', 'build-optimizer'])(
    'requires the Qovery MCP for the %s template',
    (id) => {
      expect(getAgenticWorkflowTemplate(id)?.requiresQoveryMcp).toBe(true)
    }
  )

  it('exposes the Build & deployment optimizer use case', () => {
    const template = getAgenticWorkflowTemplate('build-optimizer')
    expect(template).toBeDefined()
    expect(template?.title).toBe('Build & deployment optimizer')
    expect(template?.seed.agentPrompt).toBeTruthy()
    expect(template?.seed.cpu).toBe('1000')
    expect(template?.seed.memory).toBe('2046')
    expect(template?.seed.automations).toEqual([
      expect.objectContaining({
        triggers: [
          expect.objectContaining({
            type: 'schedule',
            cronExpression: '0 8 * * 1',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }),
        ],
      }),
    ])
    // Runs on Qovery, so it needs no user-provided credential.
    expect(template?.variables).toBeUndefined()
    // Least-privilege: must not inherit the wildcard host allowlist.
    expect(template?.seed.whitelistHosts).toBeTruthy()
    expect(template?.seed.whitelistHosts).not.toBe('*')
  })

  it('returns undefined for an unknown template id', () => {
    expect(getAgenticWorkflowTemplate('does-not-exist')).toBeUndefined()
    expect(getAgenticWorkflowTemplate(undefined)).toBeUndefined()
  })

  it('gives every template a unique id and an icon', () => {
    const ids = AGENTIC_WORKFLOW_TEMPLATES.map((template) => template.id)
    expect(new Set(ids).size).toBe(ids.length)
    AGENTIC_WORKFLOW_TEMPLATES.forEach((template) => {
      expect(template.iconName ?? template.logoPath).toBeTruthy()
    })
  })

  it('allocates at least 1000 mCPU and 2046 MiB of memory to every template', () => {
    AGENTIC_WORKFLOW_TEMPLATES.forEach((template) => {
      expect(Number(template.seed.cpu)).toBeGreaterThanOrEqual(1000)
      expect(Number(template.seed.memory)).toBeGreaterThanOrEqual(2046)
    })
  })

  it('places the build optimizer before coding agents', () => {
    expect(AGENTIC_WORKFLOW_TEMPLATES.map((template) => template.id)).toEqual([
      'incident-io-analyzer',
      'honeybadger-incident-analyzer',
      'build-optimizer',
      'jira-coding-agent',
      'linear-coding-agent',
    ])
  })
})
