import { render, waitFor } from '__tests__/utils/setup-jest'
import { useLocation } from 'react-router-dom'
import { SETTINGS_GIT_REPOSITORY_ACCESS_URL, SETTINGS_URL } from '@qovery/shared/routes'
import GithubApplicationCallbackFeature from './github-application-callback-feature'

const mockedUseNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useLocation: jest.fn(),
}))

const useLocationMock = useLocation as jest.Mock

describe('GithubApplicationCallbackFeature', () => {
  beforeEach(() => {
    useLocationMock.mockReturnValue({
      search:
        '?code=2228e6d764186b620824&installation_id=34409858&setup_action=install&state=7575b658-9a86-488c-b308-a79fb8050d21',
      pathname: 'login',
    })
  })

  it('should render successfully', () => {
    const { baseElement } = render(<GithubApplicationCallbackFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should navigate to root if a query param is missing', async () => {
    useLocationMock.mockReturnValue({
      search: '?state=7575b658-9a86-488c-b308-a79fb8050d21',
      pathname: 'login',
    })
    render(<GithubApplicationCallbackFeature />)

    await waitFor(() => {
      expect(mockedUseNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('should navigate to github application settings page if everything goes well', async () => {
    render(<GithubApplicationCallbackFeature />)

    await waitFor(() => {
      expect(mockedUseNavigate).toHaveBeenCalledWith(
        SETTINGS_URL('7575b658-9a86-488c-b308-a79fb8050d21') + SETTINGS_GIT_REPOSITORY_ACCESS_URL
      )
    })
  })
})
