import { getJsonError, isGitRepositoryComplete, isOutputComplete } from './agentic-workflow-configuration'

describe('AgenticWorkflowConfiguration validation', () => {
  it('should require valid JSON only when a required JSON field is empty or invalid', () => {
    expect(getJsonError('', false)).toBeUndefined()
    expect(getJsonError('', true)).toBe('Please enter a valid JSON configuration.')
    expect(getJsonError('{"mcpServers":{}}', true)).toBeUndefined()
    expect(getJsonError('{invalid', true)).toBe('Invalid JSON format.')
  })

  it('should require token, repository, and branch for configured repositories', () => {
    expect(
      isGitRepositoryComplete({
        provider: 'GITHUB',
        repository: 'https://github.com/qovery/console',
        branch: 'main',
      })
    ).toBe(true)

    expect(
      isGitRepositoryComplete({
        provider: 'GITHUB',
        repository: 'https://github.com/qovery/console',
        branch: '',
      })
    ).toBe(false)
  })

  it('should require a webhook URL for configured output webhooks', () => {
    expect(isOutputComplete({ url: 'https://hooks.example.com/workflow', headersJson: '{}', prompt: '' })).toBe(true)
    expect(isOutputComplete({ url: '', headersJson: '{}', prompt: 'Notify the team.' })).toBe(false)
  })
})
