import {
  agenticWorkflowJsonValidation,
  agenticWorkflowOutputsValidation,
  formatAgenticWorkflowRepositories,
  getGitRepositoryName,
} from './agentic-workflow-settings'

describe('Agentic Workflow settings validation', () => {
  it('rejects malformed JSON', () => {
    expect(agenticWorkflowJsonValidation('{')).toBe('Invalid JSON format.')
  })

  it('requires a URL for every output webhook', () => {
    expect(agenticWorkflowOutputsValidation('[{"name":"Output 1"}]')).toBe('Each output webhook must have a URL.')
    expect(agenticWorkflowOutputsValidation('[{"name":"Output 1","url":"https://example.com/hook"}]')).toBe(true)
  })

  it.each([
    ['https://github.com/qovery/console.git', 'qovery/console'],
    ['https://gitlab.com/qovery/backend', 'qovery/backend'],
    ['qovery/console', 'qovery/console'],
  ])('normalizes the repository value displayed by Git settings', (url, expected) => {
    expect(getGitRepositoryName(url)).toBe(expected)
  })

  it('uses the full repository URL in the edit payload', () => {
    expect(
      formatAgenticWorkflowRepositories([
        {
          repository: 'qovery/console',
          branch: 'staging',
          gitTokenId: 'token-1',
          gitRepository: {
            id: 'repo-1',
            name: 'qovery/console',
            url: 'https://github.com/qovery/console.git',
          },
        },
      ])
    ).toEqual([
      {
        url: 'https://github.com/qovery/console.git',
        branch: 'staging',
        git_token_id: 'token-1',
      },
    ])
  })
})
