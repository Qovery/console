import { useLocation } from '@tanstack/react-router'
import { render, waitFor } from '__tests__/utils/setup-jest'
import { SETTINGS_GIT_REPOSITORY_ACCESS_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { useConnectGithubApp } from '../hooks/use-connect-github-app/use-connect-github-app'
import GithubApplicationCallbackFeature from './github-application-callback-feature'

const mockedUseNavigate = jest.fn()
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => mockedUseNavigate,
  useLocation: jest.fn(),
}))

jest.mock('../hooks/use-connect-github-app/use-connect-github-app', () => ({
  useConnectGithubApp: jest.fn(),
}))

const useLocationMock = useLocation as jest.Mock
const mockConnectGithubApp = jest.fn()

describe('GithubApplicationCallbackFeature', () => {
  beforeEach(() => {
    useLocationMock.mockReturnValue(
      '?code=2228e6d764186b620824&installation_id=34409858&setup_action=install&state=7575b658-9a86-488c-b308-a79fb8050d21'
    )
    mockConnectGithubApp.mockResolvedValue(undefined)
    jest.mocked(useConnectGithubApp).mockReturnValue({
      mutateAsync: mockConnectGithubApp,
    } as unknown as ReturnType<typeof useConnectGithubApp>)
  })

  it('should render successfully', () => {
    const { baseElement } = render(<GithubApplicationCallbackFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should navigate to root if a query param is missing', async () => {
    useLocationMock.mockReturnValue('?state=7575b658-9a86-488c-b308-a79fb8050d21')
    render(<GithubApplicationCallbackFeature />)

    await waitFor(() => {
      expect(mockedUseNavigate).toHaveBeenCalledWith({ to: '/' })
    })
    expect(mockConnectGithubApp).not.toHaveBeenCalled()
  })

  it('should navigate to github application settings page if everything goes well', async () => {
    render(<GithubApplicationCallbackFeature />)

    await waitFor(() => {
      expect(mockedUseNavigate).toHaveBeenCalledWith({
        to: SETTINGS_URL('7575b658-9a86-488c-b308-a79fb8050d21') + SETTINGS_GIT_REPOSITORY_ACCESS_URL,
      })
    })
    expect(mockConnectGithubApp).toHaveBeenCalledWith({
      organizationId: '7575b658-9a86-488c-b308-a79fb8050d21',
      appConnectRequest: { code: '2228e6d764186b620824', installation_id: '34409858' },
    })
  })
})
