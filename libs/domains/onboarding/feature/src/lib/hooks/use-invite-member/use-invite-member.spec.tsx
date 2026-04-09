import { Wrapper } from '__tests__/utils/providers'
import { type PropsWithChildren } from 'react'
import { ACCEPT_INVITATION_URL, LOGIN_URL } from '@qovery/shared/routes'
import { act, renderHook } from '@qovery/shared/util-tests'
import { useInviteMember } from './use-invite-member'

const mockUseNavigate = jest.fn()
const mockUseLocation = jest.fn(() => ({ pathname: '/', search: '' }))
const mockRefetchMemberInvitation = jest.fn()
const mockRefetchOrganizations = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => mockUseNavigate,
  useLocation: () => mockUseLocation(),
}))

jest.mock('@qovery/domains/organizations/feature', () => ({
  useAcceptInviteMember: () => ({ mutateAsync: jest.fn() }),
  useMemberInvitation: () => ({ refetch: mockRefetchMemberInvitation }),
  useOrganizations: () => ({ refetch: mockRefetchOrganizations }),
}))

jest.mock('@qovery/shared/util-hooks', () => ({
  useLocalStorage: (key: string, initialValue: unknown) => {
    const { useState } = jest.requireActual('react')

    const getStoredValue = () => {
      const storedValue = globalThis.localStorage.getItem(key)
      return storedValue ? JSON.parse(storedValue) : initialValue
    }

    const [value, setValue] = useState(getStoredValue)

    const setStoredValue = (nextValue: unknown) => {
      const resolvedValue = typeof nextValue === 'function' ? nextValue(value) : nextValue

      if (resolvedValue === undefined || resolvedValue === null) {
        globalThis.localStorage.removeItem(key)
      } else {
        globalThis.localStorage.setItem(key, JSON.stringify(resolvedValue))
      }

      setValue(resolvedValue)
    }

    return [value, setStoredValue]
  },
}))

describe('useInviteMember Hook', () => {
  beforeEach(() => {
    localStorage.clear()
    mockUseNavigate.mockClear()
    mockUseLocation.mockReturnValue({ pathname: '/', search: '' })
    mockRefetchMemberInvitation.mockClear()
    mockRefetchOrganizations.mockClear()
    window.history.pushState({}, 'Test page', '/')
  })

  it('should initialize invitation from the query string and remove redirection from localStorage', async () => {
    localStorage.setItem('redirectLoginUri', '/organization/123')
    const SearchWrapper = ({ children }: PropsWithChildren) => (
      <Wrapper route="/accept-invitation?inviteToken=123&organization=456">{children}</Wrapper>
    )

    const { result } = renderHook(() => useInviteMember(), { wrapper: SearchWrapper })

    let hasInvitation: boolean | undefined
    await act(async () => {
      hasInvitation = result.current.onSearchUpdate()
    })

    expect(hasInvitation).toBe(true)
    expect(JSON.parse(localStorage.getItem('inviteToken') ?? 'null')).toBe('123')
    expect(JSON.parse(localStorage.getItem('inviteOrganizationId') ?? 'null')).toBe('456')
    expect(localStorage.getItem('redirectLoginUri')).toBeNull()
    expect(result.current.displayInvitation).toBe(true)
  })

  it('should redirect to the acceptation page if token found in localStorage', async () => {
    localStorage.setItem('inviteToken', JSON.stringify('123'))
    localStorage.setItem('inviteOrganizationId', JSON.stringify('456'))
    mockUseLocation.mockReturnValue({
      search: '',
      pathname: '/organization',
    })

    const { result } = renderHook(() => useInviteMember(), { wrapper: Wrapper })

    let hasInvitation: boolean | undefined
    await act(async () => {
      hasInvitation = result.current.checkTokenInStorage()
    })

    expect(hasInvitation).toBe(true)
    const { redirectToAcceptPageGuard } = result.current
    await act(() => {
      redirectToAcceptPageGuard()
    })

    expect(mockUseNavigate).toHaveBeenCalled()
  })

  it('should not redirect if we are already on login', async () => {
    mockUseLocation.mockReturnValue({
      pathname: LOGIN_URL,
      search: '',
    })
    localStorage.setItem('inviteToken', JSON.stringify('123'))
    localStorage.setItem('inviteOrganizationId', JSON.stringify('456'))

    const { result } = renderHook(() => useInviteMember(), { wrapper: Wrapper })

    const { checkTokenInStorage } = result.current
    await act(() => {
      checkTokenInStorage()
    })

    const { redirectToAcceptPageGuard } = result.current
    await act(() => {
      redirectToAcceptPageGuard()
    })

    expect(mockUseNavigate).not.toHaveBeenCalled()
  })

  it('should not redirect if we are already on accept page', async () => {
    mockUseLocation.mockReturnValue({
      pathname: ACCEPT_INVITATION_URL,
      search: '',
    })
    localStorage.setItem('inviteToken', JSON.stringify('123'))
    localStorage.setItem('inviteOrganizationId', JSON.stringify('456'))

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
    expect(mockUseNavigate).not.toHaveBeenCalled()
  })

  it('should set displayInvitation to false when no invite is found in query or storage', async () => {
    const { result } = renderHook(() => useInviteMember(), { wrapper: Wrapper })

    let hasInvitation: boolean | undefined
    await act(async () => {
      hasInvitation = result.current.initializeInvitation()
    })

    expect(hasInvitation).toBe(false)
    expect(result.current.displayInvitation).toBe(false)
    expect(localStorage.getItem('inviteToken')).toBeNull()
    expect(localStorage.getItem('inviteOrganizationId')).toBeNull()
  })

  it('should remove the inviteToken from localStorage', async () => {
    localStorage.setItem('inviteToken', JSON.stringify('123'))
    localStorage.setItem('inviteOrganizationId', JSON.stringify('456'))
    mockUseLocation.mockReturnValue({
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
