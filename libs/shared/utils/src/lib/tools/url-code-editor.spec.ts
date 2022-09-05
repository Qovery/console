import { ApplicationGitRepository, GitProviderEnum } from 'qovery-typescript-axios'
import { urlCodeEditor } from './url-code-editor'

const gitRepository: ApplicationGitRepository = {
  provider: GitProviderEnum.GITHUB,
  url: 'https://github.com/benamib/go-http-server.git',
  branch: 'main',
}

describe('Build url for code editor', () => {
  it('should generate an url for Github application', () => {
    const url = urlCodeEditor(gitRepository)
    expect(url).toEqual('https://github.dev/benamib/go-http-server/tree/main')
  })

  it('should generate an url for Gitlab application', () => {
    gitRepository.provider = GitProviderEnum.GITLAB
    gitRepository.url = 'https://gitlab.com/qovery/frontend/q-backoffice'

    const url = urlCodeEditor(gitRepository)
    expect(url).toEqual('https://gitpod.io/#https://gitlab.com/qovery/frontend/q-backoffice/tree/main')
  })

  it('should not generate an url for Bitbucket application', () => {
    gitRepository.provider = GitProviderEnum.BITBUCKET
    gitRepository.url = 'https://bitbucket.org/remi_bonnet/my-test'

    const url = urlCodeEditor(gitRepository)
    expect(url).toEqual('https://gitpod.io/#https://bitbucket.org/remi_bonnet/my-test/tree/main')
  })
})
