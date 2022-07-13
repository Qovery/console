import { useRedirectIfLogged } from './use-redirect-if-logged'
import { renderHook } from '@testing-library/react-hooks'
import { Wrapper } from '__tests__/utils/providers'
import {
  getCurrentOrganizationIdFromStorage,
  getCurrentProjectIdFromStorage,
  getRedirectLoginUriFromStorage,
} from './utils/utils'
import { OVERVIEW_URL } from '@console/shared/router'

jest.mock('./utils/utils')

const mockedUsedNavigate = jest.fn()
jest.mock('react-router', () => ({
  ...(jest.requireActual('react-router') as any),
  useNavigate: () => mockedUsedNavigate,
}))

describe('UseRedirectIfLogged', () => {
  it('should render successfully', () => {
    const { result } = renderHook(useRedirectIfLogged)
    expect(result).toBeTruthy()
  })

  it('should redirect to the stored localStorage last visited URL', () => {
    const mockRedirect = getRedirectLoginUriFromStorage as jest.Mock<string | null>
    mockRedirect.mockImplementation(() => '/login')
    renderHook(useRedirectIfLogged, { wrapper: Wrapper })
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/login')
  })

  it('should redirect to the last visited project', () => {
    const mockGetCurrentOrganizationId = getCurrentOrganizationIdFromStorage as jest.Mock<string | null>
    const mockGetCurrentProjectId = getCurrentProjectIdFromStorage as jest.Mock<string | null>
    mockGetCurrentOrganizationId.mockImplementation(() => 'fff')
    mockGetCurrentProjectId.mockImplementation(() => 'iii')
    renderHook(useRedirectIfLogged, { wrapper: Wrapper })
    expect(mockedUsedNavigate).toHaveBeenCalledWith(OVERVIEW_URL('fff', 'iii'))
  })
})
