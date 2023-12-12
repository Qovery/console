import { getGitTokenValue, guessGitProvider } from './util-git'

describe('util-git', () => {
  it('should parse a valid token value', () => {
    const tokenValue = 'TOKEN_github_123'
    const result = getGitTokenValue(tokenValue)
    expect(result).toEqual({ type: 'github', id: '123' })
  })

  it('should return null for an invalid token value', () => {
    const tokenValue = 'INVALID'
    const result = getGitTokenValue(tokenValue)
    expect(result).toBeNull()
  })

  it('should return GITHUB for a valid GitHub URL', () => {
    const url = 'https://github.com/user/my-repo'
    expect(guessGitProvider(url)).toBe('GITHUB')
  })

  it('should return GITLAB for a valid GitLab URL', () => {
    const url = 'https://gitlab.com/user/my-repo'
    expect(guessGitProvider(url)).toBe('GITLAB')
  })

  it('should return BITBUCKET for a valid Bitbucket URL', () => {
    const url = 'https://bitbucket.org/user/my-repo'
    expect(guessGitProvider(url)).toBe('BITBUCKET')
  })
})
