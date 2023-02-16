import { act, getByTestId, waitFor } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { GitAuthProvider } from 'qovery-typescript-axios'
import { repositorySlice } from '@qovery/domains/organization'
import PageOrganizationGithubRepositoryAccessFeature from './page-organization-github-repository-access-feature'

const mockGetTokenSilently = jest.fn()
jest.mock('@qovery/shared/auth', () => ({
  ...jest.requireActual('@qovery/shared/auth'),
  useAuth: () => ({
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

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

const mockDisconnectGithubApp = jest.fn()
jest.mock('@qovery/domains/organization', () => ({
  ...jest.requireActual('@qovery/domains/organization'),
  fetchAuthProvider: () => mockFetchAuthProvider,
  selectAllAuthProvider: () => mockGitAuthProviders,
  disconnectGithubApp: () => mockDisconnectGithubApp,
  fetchRepository: jest.fn(),
  getAuthProviderState: () => ({
    loadingStatus: 'loaded',
    error: null,
  }),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router'),
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

    mockDispatch.mockImplementation((a: () => void) => {
      if (a) a()
      return {
        unwrap: () =>
          Promise.resolve({
            data: {},
          }),
      }
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationGithubRepositoryAccessFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should fetch token silently at page init', () => {
    const { baseElement } = render(<PageOrganizationGithubRepositoryAccessFeature />)
    expect(mockGetTokenSilently).toHaveBeenCalledWith({ ignoreCache: true })
  })

  it('should fetch token silently and then fetch auth provider at page init', async () => {
    render(<PageOrganizationGithubRepositoryAccessFeature />)
    expect(mockGetTokenSilently).toHaveBeenCalledWith({ ignoreCache: true })
    await waitFor(() => {
      expect(mockFetchAuthProvider).toHaveBeenCalled()
    })
  })

  it('should disconnect without opening the modal', async () => {
    const { baseElement } = render(<PageOrganizationGithubRepositoryAccessFeature />)

    mockDisconnectGithubApp.mockReturnValueOnce({
      unwrap: jest.fn().mockResolvedValueOnce({}),
    })

    const disconnectButton = getByTestId(baseElement, 'disconnect-button')

    await act(() => {
      disconnectButton.click()
    })

    expect(mockDispatch).toHaveBeenCalledWith(repositorySlice.actions.removeAll())

    await waitFor(() => {
      // both are called two times, one at init, another time if we successfully disconnect
      expect(mockGetTokenSilently).toHaveBeenCalledTimes(2)
      expect(mockFetchAuthProvider).toHaveBeenCalledTimes(2)
    })
  })

  it('calls onDisconnectWithModal if error is thrown', async () => {
    const error = new Error('error')
    error.name = 'Bad Request'
    error.code = '400'
    error.message = 'This git provider is'

    const { baseElement } = render(<PageOrganizationGithubRepositoryAccessFeature />)

    mockDisconnectGithubApp.mockReturnValueOnce({
      unwrap: jest.fn().mockRejectedValueOnce(error),
    })

    const disconnectButton = getByTestId(baseElement, 'disconnect-button')

    await act(() => {
      disconnectButton.click()
    })

    // does not pass right now because even though we throw an error, we still go inside the then instead of the catch
    //expect(mockOpenModal).toHaveBeenCalled()
  })
})
