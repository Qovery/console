import { AGENTIC_WORKFLOW_TEMPLATES, getAgenticWorkflowTemplate } from './agentic-workflow-templates'

describe('agentic-workflow-templates', () => {
  it('exposes the Jira to spec use case', () => {
    const template = getAgenticWorkflowTemplate('jira-to-spec')
    expect(template).toBeDefined()
    expect(template?.title).toBe('Jira to spec')
    expect(template?.seed.name).toBe('Jira to spec')
    expect(template?.seed.agentPrompt).toBeTruthy()
    expect(template?.seed.whitelistHosts).toBe('*.atlassian.net')
  })

  it('seeds Jira credential variables with a secret API token', () => {
    const template = getAgenticWorkflowTemplate('jira-to-spec')
    expect(template?.variables?.map((variable) => variable.variable)).toEqual([
      'JIRA_BASE_URL',
      'JIRA_EMAIL',
      'JIRA_API_TOKEN',
    ])
    expect(template?.variables?.find((variable) => variable.variable === 'JIRA_API_TOKEN')?.isSecret).toBe(true)
  })

  it('returns undefined for an unknown template id', () => {
    expect(getAgenticWorkflowTemplate('does-not-exist')).toBeUndefined()
    expect(getAgenticWorkflowTemplate(undefined)).toBeUndefined()
  })

  it('gives every template a unique id and an icon', () => {
    const ids = AGENTIC_WORKFLOW_TEMPLATES.map((template) => template.id)
    expect(new Set(ids).size).toBe(ids.length)
    AGENTIC_WORKFLOW_TEMPLATES.forEach((template) => {
      expect(template.iconUri).toBeTruthy()
    })
  })
})
