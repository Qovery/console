import { Wrapper } from '__tests__/utils/providers'
import { renderHook } from '__tests__/utils/setup-jest'
import { OVERVIEW_URL } from '@qovery/shared/routes'
import { useRedirectIfLogged } from './use-redirect-if-logged'
import {
  getCurrentOrganizationIdFromStorage,
  getCurrentProjectIdFromStorage,
  getCurrentProvider,
  getRedirectLoginUriFromStorage,
} from './utils/utils'

jest.mock('./utils/utils')

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}))

jest.mock('@qovery/shared/auth', () => ({
  ...jest.requireActual('@qovery/shared/auth'),
  useAuth: () => {
    return {
      user: {
        sub: 'github',
      },
    }
  },
}))

jest.mock('@elgorditosalsero/react-gtm-hook', () => ({
  ...jest.requireActual('@elgorditosalsero/react-gtm-hook'),
  useGTMDispatch: jest.fn(),
}))

describe('UseRedirectIfLogged', () => {
  it('should render successfully', () => {
    const { result } = renderHook(useRedirectIfLogged, { wrapper: Wrapper })
    expect(result).toBeTruthy()
  })

  it('should redirect to the stored localStorage last visited URL', () => {
    const mockRedirect = getRedirectLoginUriFromStorage as jest.Mock<string | null>
    const mockGetCurrentProvider = getCurrentProvider as jest.Mock<string | null>
    mockGetCurrentProvider.mockImplementation(() => 'github')
    mockRedirect.mockImplementation(() => '/login')
    renderHook(useRedirectIfLogged, { wrapper: Wrapper })
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/login')
  })

  it('should redirect to the last visited project', () => {
    const mockGetCurrentOrganizationId = getCurrentOrganizationIdFromStorage as jest.Mock<string | null>
    const mockGetCurrentProjectId = getCurrentProjectIdFromStorage as jest.Mock<string | null>
    const mockGetCurrentProvider = getCurrentProvider as jest.Mock<string | null>
    mockGetCurrentOrganizationId.mockImplementation(() => 'fff')
    mockGetCurrentProjectId.mockImplementation(() => 'iii')
    mockGetCurrentProvider.mockImplementation(() => 'github')
    renderHook(useRedirectIfLogged, { wrapper: Wrapper })
    expect(mockedUsedNavigate).toHaveBeenCalledWith(OVERVIEW_URL('fff', 'iii'))
  })
})
