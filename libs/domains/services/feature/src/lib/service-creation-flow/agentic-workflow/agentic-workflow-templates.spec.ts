import { AGENTIC_WORKFLOW_TEMPLATES, getAgenticWorkflowTemplate } from './agentic-workflow-templates'

describe('agentic-workflow-templates', () => {
  it('exposes the Incident Analyser use case', () => {
    const template = getAgenticWorkflowTemplate('incident-analyser')
    expect(template).toBeDefined()
    expect(template?.title).toBe('Incident Analyser')
    expect(template?.seed.name).toBe('Incident Analyser')
    expect(template?.seed.agentPrompt).toBeTruthy()
    expect(template?.seed.cpu).toBe('200')
    expect(template?.seed.memory).toBe('256')
    expect(template?.variables?.map((variable) => variable.variable)).toEqual([
      'INCIDENT_IO_API_KEY',
      'SLACK_WEBHOOK_URL',
    ])
    expect(template?.variables?.every((variable) => variable.isSecret)).toBe(true)
  })

  it('exposes the Build & deployment optimizer use case', () => {
    const template = getAgenticWorkflowTemplate('build-optimizer')
    expect(template).toBeDefined()
    expect(template?.title).toBe('Build & deployment optimizer')
    expect(template?.seed.agentPrompt).toBeTruthy()
    expect(template?.seed.cpu).toBe('200')
    expect(template?.seed.memory).toBe('256')
    expect(template?.variables?.map((variable) => variable.variable)).toEqual(['QOVERY_API_TOKEN'])
  })

  it('returns undefined for an unknown template id', () => {
    expect(getAgenticWorkflowTemplate('does-not-exist')).toBeUndefined()
    expect(getAgenticWorkflowTemplate(undefined)).toBeUndefined()
  })

  it('gives every template a unique id and an icon', () => {
    const ids = AGENTIC_WORKFLOW_TEMPLATES.map((template) => template.id)
    expect(new Set(ids).size).toBe(ids.length)
    AGENTIC_WORKFLOW_TEMPLATES.forEach((template) => {
      expect(template.iconName).toBeTruthy()
    })
  })
})
