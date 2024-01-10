import { act, getByTestId } from '__tests__/utils/setup-jest'
import { type GitAuthProvider } from 'qovery-typescript-axios'
import { renderWithProviders, waitFor } from '@qovery/shared/util-tests'
import PageOrganizationGithubRepositoryAccessFeature from './page-organization-github-repository-access-feature'

const mockGetTokenSilently = jest.fn().mockImplementation(() => Promise.resolve())
jest.mock('@qovery/shared/auth', () => ({
  ...jest.requireActual('@auth0/auth0-react'),
  useAuth0: () => ({
    getAccessTokenSilently: mockGetTokenSilently,
  }),
}))

const mockFetchAuthProvider = jest.fn()
const mockGitAuthProviders: GitAuthProvider[] = [
  {
    name: 'GITHUB',
    use_bot: true,
    owner: 'owner',
    id: 'id',
  },
]

const mockOpenModal = jest.fn()
jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    openModal: mockOpenModal,
  }),
}))

const mockDisconnectGithubApp = jest.fn()
jest.mock('@qovery/domains/organizations/feature', () => {
  return {
    ...jest.requireActual('@qovery/domains/organizations/feature'),
    useAuthProviders: () => ({
      data: mockGitAuthProviders,
      refetch: mockGitAuthProviders,
    }),
    useDisconnectGithubApp: () => ({
      mutateAsync: mockDisconnectGithubApp,
    }),
    useRepositories: () => ({
      data: [],
    }),
  }
})

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '1' }),
  Link: () => <div />,
}))

describe('PageOrganizationGithubRepositoryAccessFeature', () => {
  beforeEach(() => {
    mockGetTokenSilently.mockImplementation(() =>
      Promise.resolve({
        data: {},
      })
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageOrganizationGithubRepositoryAccessFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should fetch token silently at page init', () => {
    renderWithProviders(<PageOrganizationGithubRepositoryAccessFeature />)
    expect(mockGetTokenSilently).toHaveBeenCalledWith({ ignoreCache: true })
  })

  it('should fetch token silently and then fetch auth provider at page init', async () => {
    renderWithProviders(<PageOrganizationGithubRepositoryAccessFeature />)
    expect(mockGetTokenSilently).toHaveBeenCalledWith({ ignoreCache: true })
    await waitFor(() => {
      expect(mockFetchAuthProvider).toHaveBeenCalled()
    })
  })

  it('should disconnect without opening the modal', async () => {
    const { baseElement } = renderWithProviders(<PageOrganizationGithubRepositoryAccessFeature />)

    mockDisconnectGithubApp.mockReturnValueOnce({
      unwrap: jest.fn().mockResolvedValueOnce({}),
    })

    const disconnectButton = getByTestId(baseElement, 'disconnect-button')

    await act(() => {
      disconnectButton.click()
    })

    await waitFor(() => {
      // both are called two times, one at init, another time if we successfully disconnect
      expect(mockGetTokenSilently).toHaveBeenCalledTimes(2)
      expect(mockFetchAuthProvider).toHaveBeenCalledTimes(2)
    })
  })

  it('calls onDisconnectWithModal if error is thrown', async () => {
    const error = new Error('error')
    error.name = 'Bad Request'
    error.message = 'This git provider is'

    const { baseElement } = renderWithProviders(<PageOrganizationGithubRepositoryAccessFeature />)

    mockDisconnectGithubApp.mockReturnValueOnce({
      unwrap: jest.fn().mockRejectedValueOnce(error),
    })

    const disconnectButton = getByTestId(baseElement, 'disconnect-button')

    await act(() => {
      disconnectButton.click()
    })
  })
})
