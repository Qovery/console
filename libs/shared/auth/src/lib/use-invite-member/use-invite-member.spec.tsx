import { act } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { Wrapper } from '__tests__/utils/providers'
import { useLocation } from 'react-router-dom'
import { ACCEPT_INVITATION_URL, LOGIN_URL } from '@qovery/shared/router'
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

  it('should store the tokens from the query inside localstorage and remove redirection from localStorage', () => {
    localStorage.setItem('redirectLoginUri', '/organization/123')
    ;(useLocation as jest.Mock).mockReturnValue({
      search: '?inviteToken=123&organization=456',
      pathname: 'login',
    })

    renderHook(() => useInviteMember(), { wrapper: Wrapper })

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

    renderHook(() => useInviteMember(), { wrapper: Wrapper })
    expect(mockedUseNavigate).toHaveBeenCalled()
  })

  it('should not redirect if we are already on login', () => {
    ;(useLocation as jest.Mock).mockReturnValue({
      search: '?inviteToken=123&organization=456',
      pathname: LOGIN_URL,
    })

    renderHook(() => useInviteMember(), { wrapper: Wrapper })
    expect(mockedUseNavigate).not.toHaveBeenCalled()
  })

  it('should not redirect if we are already on accept page', () => {
    ;(useLocation as jest.Mock).mockReturnValue({
      search: '?inviteToken=123&organization=456',
      pathname: ACCEPT_INVITATION_URL,
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
