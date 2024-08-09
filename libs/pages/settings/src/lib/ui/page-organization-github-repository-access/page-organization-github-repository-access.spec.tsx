import { renderWithProviders } from '@qovery/shared/util-tests'
import PageOrganizationGithubRepositoryAccess, {
  type PageOrganizationGithubRepositoryAccessProps,
} from './page-organization-github-repository-access'

const props: PageOrganizationGithubRepositoryAccessProps = {
  onDisconnect: jest.fn(),
  onConfigure: jest.fn(),
  authProviderLoading: false,
  githubAuthProvider: {
    name: 'GITHUB',
    owner: 'owner',
    id: 'id',
    use_bot: true,
  },
  githubConnectURL: 'githubConnectURL',
  repositories: [],
  repositoriesLoading: false,
}

describe('PageOrganizationGithubRepositoryAccess', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageOrganizationGithubRepositoryAccess {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
