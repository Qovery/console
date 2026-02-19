import { type Auth0ProviderOptions } from '@auth0/auth0-react'
import { jwtDecode } from 'jwt-decode'
import { type GitAuthProvider } from 'qovery-typescript-axios'
import { renderWithProviders, waitFor } from '@qovery/shared/util-tests'
import { useAuthProviders } from '../hooks/use-auth-providers/use-auth-providers'
import { useDisconnectGithubApp } from '../hooks/use-disconnect-github-app/use-disconnect-github-app'
import { useRepositories } from '../hooks/use-repositories/use-repositories'
import { SettingsGitRepositoryAccess } from './settings-git-repository-access'

const mockGetTokenSilently = jest.fn()
jest.mock('@auth0/auth0-react', () => ({
  Auth0Provider: ({ children }: Auth0ProviderOptions) => children,
  useAuth0: () => ({
    getAccessTokenSilently: mockGetTokenSilently,
  }),
}))

jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
}))

const mockOpenModal = jest.fn()
const mockCloseModal = jest.fn()
jest.mock('@qovery/shared/ui', () => {
  const actual = jest.requireActual('@qovery/shared/ui')
  return {
    ...actual,
    useModal: jest.fn(),
  }
})

jest.mock('../git-token-list/git-token-list', () => {
  const MockGitTokenList = () => <div data-testid="git-token-list" />
  return {
    __esModule: true,
    GitTokenList: MockGitTokenList,
    default: MockGitTokenList,
  }
})

jest.mock('../hooks/use-auth-providers/use-auth-providers')
jest.mock('../hooks/use-disconnect-github-app/use-disconnect-github-app')
jest.mock('../hooks/use-repositories/use-repositories')

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: '1' }),
}))

const mockRefetchAuthProviders = jest.fn()
const mockDisconnectGithubApp = jest.fn()
const mockGitAuthProviders: GitAuthProvider[] = [
  {
    name: 'GITHUB',
    use_bot: true,
    owner: 'owner',
    id: 'id',
  },
]

describe('SettingsGitRepositoryAccess', () => {
  const useAuthProvidersMock = useAuthProviders as jest.MockedFunction<typeof useAuthProviders>
  const useDisconnectGithubAppMock = useDisconnectGithubApp as jest.MockedFunction<typeof useDisconnectGithubApp>
  const useRepositoriesMock = useRepositories as jest.MockedFunction<typeof useRepositories>
  const jwtDecodeMock = jwtDecode as jest.MockedFunction<typeof jwtDecode>

  beforeEach(() => {
    const { useModal } = jest.requireMock('@qovery/shared/ui')
    useModal.mockReturnValue({
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
    })

    mockGetTokenSilently.mockResolvedValue('mock-token')
    jwtDecodeMock.mockReturnValue({
      'https://qovery.com/githubapp_installations': [],
    })

    useAuthProvidersMock.mockReturnValue({
      data: mockGitAuthProviders,
      refetch: mockRefetchAuthProviders,
      isLoading: false,
    } as ReturnType<typeof useAuthProviders>)

    useDisconnectGithubAppMock.mockReturnValue({
      mutateAsync: mockDisconnectGithubApp,
      isLoading: false,
    } as ReturnType<typeof useDisconnectGithubApp>)

    useRepositoriesMock.mockReturnValue({
      data: [],
      isLoading: false,
    } as ReturnType<typeof useRepositories>)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<SettingsGitRepositoryAccess />)
    expect(baseElement).toBeTruthy()
  })

  it('should fetch token silently and then refetch auth provider at page init', async () => {
    renderWithProviders(<SettingsGitRepositoryAccess />)

    await waitFor(() => {
      expect(mockGetTokenSilently).toHaveBeenCalled()
      expect(mockRefetchAuthProviders).toHaveBeenCalled()
    })
  })
})
