import { act } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { Wrapper } from '__tests__/utils/providers'
import { useLocation } from 'react-router-dom'
import { ACCEPT_INVITATION_URL, LOGIN_URL } from '@qovery/shared/routes'
import { useInviteMember } from './use-invite-member'

// mock useNavigate
const mockedUseNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useNavigate: () => mockedUseNavigate,
  useLocation: jest.fn(),
}))

describe('useInviteMember Hook', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should store the tokens from the query inside localstorage and remove redirection from localStorage', async () => {
    localStorage.setItem('redirectLoginUri', '/organization/123')
    ;(useLocation as jest.Mock).mockReturnValue({
      search: '?inviteToken=123&organization=456',
      pathname: 'login',
    })

    const renderedHook = renderHook(() => useInviteMember(), { wrapper: Wrapper })

    const { onSearchUpdate } = renderedHook.result.current
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
    ;(useLocation as jest.Mock).mockReturnValue({
      search: '',
      pathname: '/organization',
    })

    const renderedHook = renderHook(() => useInviteMember(), { wrapper: Wrapper })

    const { checkTokenInStorage } = renderedHook.result.current
    await act(() => {
      checkTokenInStorage()
    })

    const { redirectToAcceptPageGuard } = renderedHook.result.current
    await act(() => {
      redirectToAcceptPageGuard()
    })

    expect(mockedUseNavigate).toHaveBeenCalled()
  })

  it('should not redirect if we are already on login', async () => {
    ;(useLocation as jest.Mock).mockReturnValue({
      search: '?inviteToken=123&organization=456',
      pathname: LOGIN_URL,
    })

    const renderedHook = renderHook(() => useInviteMember(), { wrapper: Wrapper })

    const { checkTokenInStorage } = renderedHook.result.current
    await act(() => {
      checkTokenInStorage()
    })

    const { redirectToAcceptPageGuard } = renderedHook.result.current
    await act(() => {
      redirectToAcceptPageGuard()
    })

    expect(mockedUseNavigate).not.toHaveBeenCalled()
  })

  it('should not redirect if we are already on accept page', async () => {
    ;(useLocation as jest.Mock).mockReturnValue({
      search: '?inviteToken=123&organization=456',
      pathname: ACCEPT_INVITATION_URL,
    })

    const renderedHook = renderHook(() => useInviteMember(), { wrapper: Wrapper })

    const { checkTokenInStorage } = renderedHook.result.current
    await act(() => {
      checkTokenInStorage()
    })

    const { redirectToAcceptPageGuard } = renderedHook.result.current
    await act(() => {
      redirectToAcceptPageGuard()
    })

    renderHook(() => useInviteMember(), { wrapper: Wrapper })
    expect(mockedUseNavigate).not.toHaveBeenCalled()
  })

  it('should remove the inviteToken from localStorage', async () => {
    localStorage.setItem('inviteToken', '123')
    localStorage.setItem('inviteOrganizationId', '456')
    ;(useLocation as jest.Mock).mockReturnValue({
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
