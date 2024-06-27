import { Wrapper } from '__tests__/utils/providers'
import { useLocation } from 'react-router-dom'
import { ACCEPT_INVITATION_URL, LOGIN_URL } from '@qovery/shared/routes'
import { act, renderHook } from '@qovery/shared/util-tests'
import { useInviteMember } from './use-invite-member'

// mock useNavigate
const mockedUseNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useLocation: jest.fn(),
}))

const useLocationMock = useLocation as jest.Mock

describe('useInviteMember Hook', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should store the tokens from the query inside localstorage and remove redirection from localStorage', async () => {
    localStorage.setItem('redirectLoginUri', '/organization/123')
    useLocationMock.mockReturnValue({
      search: '?inviteToken=123&organization=456',
      pathname: 'login',
    })

    const { result } = renderHook(() => useInviteMember(), { wrapper: Wrapper })

    const { onSearchUpdate } = result.current
    await act(() => {
      onSearchUpdate()
    })

    expect(localStorage.getItem('inviteToken')).toBe('123')
    expect(localStorage.getItem('inviteOrganizationId')).toBe('456')
    expect(localStorage.getItem('redirectLoginUri')).toBeNull()
  })

  it('should redirect to the acceptation page if token found in localStorage', async () => {
    localStorage.setItem('inviteToken', '123')
    localStorage.setItem('inviteOrganizationId', '456')
    useLocationMock.mockReturnValue({
      search: '',
      pathname: '/organization',
    })

    const { result } = renderHook(() => useInviteMember(), { wrapper: Wrapper })

    const { checkTokenInStorage } = result.current
    await act(() => {
      checkTokenInStorage()
    })

    const { redirectToAcceptPageGuard } = result.current
    await act(() => {
      redirectToAcceptPageGuard()
    })

    expect(mockedUseNavigate).toHaveBeenCalled()
  })

  it('should not redirect if we are already on login', async () => {
    useLocationMock.mockReturnValue({
      search: '?inviteToken=123&organization=456',
      pathname: LOGIN_URL,
    })

    const { result } = renderHook(() => useInviteMember(), { wrapper: Wrapper })

    const { checkTokenInStorage } = result.current
    await act(() => {
      checkTokenInStorage()
    })

    const { redirectToAcceptPageGuard } = result.current
    await act(() => {
      redirectToAcceptPageGuard()
    })

    expect(mockedUseNavigate).not.toHaveBeenCalled()
  })

  it('should not redirect if we are already on accept page', async () => {
    useLocationMock.mockReturnValue({
      search: '?inviteToken=123&organization=456',
      pathname: ACCEPT_INVITATION_URL,
    })

    const { result } = renderHook(() => useInviteMember(), { wrapper: Wrapper })

    const { checkTokenInStorage } = result.current
    await act(() => {
      checkTokenInStorage()
    })

    const { redirectToAcceptPageGuard } = result.current
    await act(() => {
      redirectToAcceptPageGuard()
    })

    renderHook(() => useInviteMember(), { wrapper: Wrapper })
    expect(mockedUseNavigate).not.toHaveBeenCalled()
  })

  it('should remove the inviteToken from localStorage', async () => {
    localStorage.setItem('inviteToken', '123')
    localStorage.setItem('inviteOrganizationId', '456')
    useLocationMock.mockReturnValue({
      search: '?inviteToken=123&organization=456',
      pathname: ACCEPT_INVITATION_URL,
    })
    const { cleanInvitation } = renderHook(() => useInviteMember(), { wrapper: Wrapper }).result.current

    await act(() => {
      cleanInvitation()
    })

    expect(localStorage.getItem('inviteToken')).toBeNull()
    expect(localStorage.getItem('inviteOrganizationId')).toBeNull()
  })
})
