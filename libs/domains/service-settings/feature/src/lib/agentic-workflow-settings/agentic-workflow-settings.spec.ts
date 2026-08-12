import {
  agenticWorkflowJsonValidation,
  agenticWorkflowOutputsValidation,
  agenticWorkflowRepositoriesValidation,
} from './agentic-workflow-settings'

describe('Agentic Workflow settings validation', () => {
  it('rejects malformed JSON', () => {
    expect(agenticWorkflowJsonValidation('{')).toBe('Invalid JSON format.')
  })

  it('requires a URL and branch for every repository', () => {
    expect(agenticWorkflowRepositoriesValidation('[{"url":"https://github.com/qovery/console"}]')).toBe(
      'Each repository must have a URL and a branch.'
    )
    expect(
      agenticWorkflowRepositoriesValidation('[{"url":"https://github.com/qovery/console","branch":"staging"}]')
    ).toBe(true)
  })

  it('requires a URL for every output webhook', () => {
    expect(agenticWorkflowOutputsValidation('[{"name":"Output 1"}]')).toBe('Each output webhook must have a URL.')
    expect(agenticWorkflowOutputsValidation('[{"name":"Output 1","url":"https://example.com/hook"}]')).toBe(true)
  })
})
