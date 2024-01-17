import { type ApplicationGitRepository } from 'qovery-typescript-axios'
import { urlCodeEditor } from './url-code-editor'

const gitRepository: ApplicationGitRepository = {
  url: 'https://github.com/benamib/go-http-server.git',
  branch: 'main',
  provider: 'GITHUB',
  name: 'Github Repo',
  owner: 'Foobar',
}

describe('Build url for code editor', () => {
  it('should generate an url for Github application', () => {
    const url = urlCodeEditor(gitRepository)
    expect(url).toEqual('https://gitpod.io/#https://github.com/benamib/go-http-server/tree/main')
  })

  it('should generate an url for Gitlab application', () => {
    gitRepository.url = 'https://gitlab.com/qovery/frontend/q-backoffice'

    const url = urlCodeEditor(gitRepository)
    expect(url).toEqual('https://gitpod.io/#https://gitlab.com/qovery/frontend/q-backoffice/tree/main')
  })

  it('should not generate an url for Bitbucket application', () => {
    gitRepository.url = 'https://bitbucket.org/remi_bonnet/my-test'

    const url = urlCodeEditor(gitRepository)
    expect(url).toEqual('https://gitpod.io/#https://bitbucket.org/remi_bonnet/my-test/tree/main')
  })
})
