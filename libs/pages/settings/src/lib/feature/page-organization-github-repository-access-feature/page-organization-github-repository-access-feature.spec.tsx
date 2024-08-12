import { type Auth0ProviderOptions } from '@auth0/auth0-react'
import { type GitAuthProvider } from 'qovery-typescript-axios'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import PageOrganizationGithubRepositoryAccessFeature from './page-organization-github-repository-access-feature'

const mockGetTokenSilently = jest.fn()
jest.mock('@auth0/auth0-react', () => ({
  Auth0Provider: ({ children }: Auth0ProviderOptions) => children,
  useAuth0: () => {
    return {
      getAccessTokenSilently: mockGetTokenSilently,
    }
  },
}))

const mockRefetchAuthProviders = jest.fn()
const mockGitAuthProviders: GitAuthProvider[] = [
  {
    name: 'GITHUB',
    use_bot: true,
    owner: 'owner',
    id: 'id',
  },
]

const mockDisconnectGithubApp = jest.fn()
jest.mock('@qovery/domains/organizations/feature', () => {
  return {
    ...jest.requireActual('@qovery/domains/organizations/feature'),
    useAuthProviders: () => ({
      data: mockGitAuthProviders,
      refetch: mockRefetchAuthProviders,
      isLoading: false,
    }),
    useDisconnectGithubApp: () => ({
      mutateAsync: mockDisconnectGithubApp,
      isLoading: false,
    }),
    useRepositories: () => ({
      data: [],
      isLoading: false,
    }),
  }
})

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '1' }),
  Link: () => <div />,
}))

describe('PageOrganizationGithubRepositoryAccessFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageOrganizationGithubRepositoryAccessFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should fetch token silently and then refetch auth provider at page init', async () => {
    renderWithProviders(<PageOrganizationGithubRepositoryAccessFeature />)
    await waitFor(() => {
      expect(mockGetTokenSilently).toHaveBeenCalled()
      expect(mockRefetchAuthProviders).toHaveBeenCalled()
    })
  })
})
