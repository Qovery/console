import { GitProviderEnum } from 'qovery-typescript-axios'
import { buildGitRepoUrl } from './build-git-repo-url'

describe('buildGitRepoUrl', () => {
  it('should have function to build git url', () => {
    const provider = GitProviderEnum.GITHUB
    expect(buildGitRepoUrl(provider, 'qovery/console')).toBe('https://github.com/qovery/console.git')
  })
})
