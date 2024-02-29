import { buildGitProviderUrl, guessGitProvider } from './util-git'

describe('util-git', () => {
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

  it('should return branch url for a valid Github URL', () => {
    const url = 'https://github.com/user/my-repo'
    expect(buildGitProviderUrl(url, 'my_branch')).toBe('https://github.com/user/my-repo/tree/my_branch/')
    const url2 = 'https://github.com/user/my-repo.git'
    expect(buildGitProviderUrl(url2, 'my_branch')).toBe('https://github.com/user/my-repo/tree/my_branch/')
  })

  it('should return branch url for a valid Gitlab URL', () => {
    const url = 'https://gitlab.com/user/my-repo'
    expect(buildGitProviderUrl(url, 'my_branch')).toBe('https://gitlab.com/user/my-repo/tree/my_branch/')
    const url2 = 'https://gitlab.com/user/my-repo.git'
    expect(buildGitProviderUrl(url2, 'my_branch')).toBe('https://gitlab.com/user/my-repo/tree/my_branch/')
  })

  it('should return branch url for a valid Bitbucket URL', () => {
    const url = 'https://bitbucket.org/user/my-repo'
    expect(buildGitProviderUrl(url, 'my_branch')).toBe('https://bitbucket.org/user/my-repo/src/my_branch/')
    const url2 = 'https://bitbucket.org/user/my-repo.git'
    expect(buildGitProviderUrl(url2, 'my_branch')).toBe('https://bitbucket.org/user/my-repo/src/my_branch/')
  })
})
