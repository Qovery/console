import { type ApplicationGitRepository, GitProviderEnum } from 'qovery-typescript-axios'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders } from '@qovery/shared/util-tests'
import LastCommit from './last-commit'

const mockApplication = applicationFactoryMock(1)[0]

jest.mock('../hooks/use-commits/use-commits', () => ({
  useCommits: () => ({
    data: [
      {
        created_at: '2023-09-28T06:42:32Z',
        git_commit_id: 'ddd1cee35762e9b4bb95633c22193393ca3bb384',
        message: 'refactor(ui): rename legacy button props (#863)',
        tag: 'staging',
        author_name: 'GitHub',
        author_avatar_url: 'https://avatars.githubusercontent.com/u/19864447?v=4',
        commit_page_url: 'https://github.com/Qovery/console/commit/ddd1cee35762e9b4bb95633c22193393ca3bb384',
      },
      {
        created_at: '2023-09-27T14:58:59Z',
        git_commit_id: '136b77f8a57026d1f4760edc84dc8999a5334f97',
        message: 'refactor(ui): rename legacy button types (#862)',
        tag: 'staging',
        author_name: 'GitHub',
        author_avatar_url: 'https://avatars.githubusercontent.com/u/19864447?v=4',
        commit_page_url: 'https://github.com/Qovery/console/commit/136b77f8a57026d1f4760edc84dc8999a5334f97',
      },
    ],
    isLoading: false,
    error: null,
  }),
}))

const gitRepository: ApplicationGitRepository = {
  has_access: true,
  deployed_commit_id: 'ddd1cee35762e9b4bb95633c22193393ca3bb384',
  deployed_commit_date: '2023-09-28T06:42:35.688665Z',
  deployed_commit_contributor: 'TAGS_NOT_IMPLEMENTED',
  deployed_commit_tag: 'TAGS_NOT_IMPLEMENTED',
  provider: GitProviderEnum.GITHUB,
  owner: 'acarranoqovery',
  url: 'https://github.com/Qovery/console.git',
  name: 'Qovery/console',
  branch: 'staging',
  root_path: '/',
}

describe('LastCommit', () => {
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(<LastCommit gitRepository={gitRepository} service={mockApplication} />)
    expect(baseElement).toMatchSnapshot()
  })
})
