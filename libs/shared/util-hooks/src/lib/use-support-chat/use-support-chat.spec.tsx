import { useAuth0 } from '@auth0/auth0-react'
import { useMatches, useParams } from '@tanstack/react-router'
import { renderHook } from '@testing-library/react'
import { useIntercom } from 'react-use-intercom'
import { useSupportChat } from './use-support-chat'

jest.mock('@auth0/auth0-react', () => ({
  useAuth0: jest.fn(),
}))

jest.mock('@tanstack/react-router', () => ({
  useMatches: jest.fn(),
  useParams: jest.fn(),
}))

jest.mock('react-use-intercom', () => ({
  useIntercom: jest.fn(),
}))

describe('useSupportChat', () => {
  const mockUseAuth0 = jest.mocked(useAuth0)
  const mockUseMatches = jest.mocked(useMatches)
  const mockUseParams = jest.mocked(useParams)
  const mockUseIntercom = jest.mocked(useIntercom)
  const mockUpdateIntercom = jest.fn()
  const mockShutdownIntercom = jest.fn()
  const mockShowIntercomMessenger = jest.fn()

  beforeEach(() => {
    mockUseAuth0.mockReturnValue({
      user: {
        email: 'user@qovery.com',
        name: 'Qovery User',
        picture: 'https://example.com/avatar.png',
        sub: 'auth0|user-123',
        'https://qovery.com/pylon_hash': 'secure-hash',
        'https://qovery.com/intercom_hash': 'intercom-hash',
      },
    } as ReturnType<typeof useAuth0>)

    mockUseMatches.mockReturnValue([{ routeId: '/_authenticated/organization/$organizationId' }] as ReturnType<
      typeof useMatches
    >)
    mockUseParams.mockReturnValue({ organizationId: 'org_123' } as ReturnType<typeof useParams>)
    mockUseIntercom.mockReturnValue({
      update: mockUpdateIntercom,
      shutdown: mockShutdownIntercom,
      showMessages: mockShowIntercomMessenger,
    } as ReturnType<typeof useIntercom>)

    document.body.innerHTML = '<script id="main-script"></script>'
    delete window.pylon
    delete window.Pylon
    jest.clearAllMocks()
  })

  it('bootstraps pylon with verified user settings and no external account id misuse', () => {
    renderHook(() => useSupportChat())

    expect(window.pylon?.chat_settings).toEqual({
      app_id: process.env.NX_PUBLIC_PYLON_APP_ID,
      email: 'user@qovery.com',
      name: 'Qovery User',
      email_hash: 'secure-hash',
      avatar_url: 'https://example.com/avatar.png',
      account_external_id: 'org_123',
    })
    expect(window.pylon?.chat_settings).not.toHaveProperty('account_id')
    expect(document.getElementById('pylon-script')).not.toBeNull()
    expect(window.Pylon?.q).toEqual([])
    expect(window.Pylon?.e).toEqual(expect.any(Function))
  })

  it('queues show calls until the pylon script is loaded', () => {
    const { result } = renderHook(() => useSupportChat())

    result.current.showChat()

    expect(window.Pylon?.q).toEqual([['show']])
  })
})
