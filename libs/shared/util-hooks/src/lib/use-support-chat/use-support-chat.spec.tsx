import { useAuth0 } from '@auth0/auth0-react'
import { renderHook } from '@testing-library/react'
import { useSupportChat } from './use-support-chat'

jest.mock('@auth0/auth0-react', () => ({
  useAuth0: jest.fn(),
}))

describe('useSupportChat', () => {
  const mockUseAuth0 = jest.mocked(useAuth0)

  beforeEach(() => {
    mockUseAuth0.mockReturnValue({
      user: {
        email: 'user@qovery.com',
        name: 'Qovery User',
        picture: 'https://example.com/avatar.png',
        sub: 'auth0|user-123',
        'https://qovery.com/pylon_hash': 'secure-hash',
      },
    } as ReturnType<typeof useAuth0>)

    document.body.innerHTML = '<script id="main-script"></script>'
    delete window.pylon
    delete window.Pylon
    jest.clearAllMocks()
  })

  it('bootstraps pylon with verified user settings and no account override', () => {
    renderHook(() => useSupportChat())

    expect(window.pylon?.chat_settings).toEqual({
      app_id: process.env.NX_PUBLIC_PYLON_APP_ID,
      email: 'user@qovery.com',
      name: 'Qovery User',
      email_hash: 'secure-hash',
      avatar_url: 'https://example.com/avatar.png',
    })
    expect(window.pylon?.chat_settings).not.toHaveProperty('account_id')
    expect(window.pylon?.chat_settings).not.toHaveProperty('account_external_id')
    expect(document.getElementById('pylon-script')).not.toBeNull()
    expect(window.Pylon?.q).toEqual([])
    expect(window.Pylon?.e).toEqual(expect.any(Function))
  })

  it('queues show calls until the pylon script is loaded', () => {
    const { result } = renderHook(() => useSupportChat())

    result.current.showChat()

    expect(window.Pylon?.q).toEqual([['show']])
  })

  it('queues showTicketForm calls until the pylon script is loaded', () => {
    const { result } = renderHook(() => useSupportChat())

    result.current.showPylonForm('ask-for-activation')

    expect(window.Pylon?.q).toEqual([['showTicketForm', 'ask-for-activation']])
  })

  it('calls pylon directly once the script is ready', () => {
    const { result } = renderHook(() => useSupportChat())
    window.Pylon = jest.fn() as unknown as typeof window.Pylon

    result.current.showChat()

    expect(window.Pylon).toHaveBeenCalledWith('show')
  })

  it('re-inserts the pylon script tag when initChat is called', () => {
    const { result } = renderHook(() => useSupportChat())
    document.getElementById('pylon-script')?.remove()

    result.current.initChat()

    expect(document.getElementById('pylon-script')).not.toBeNull()
  })

  it('merges settings into the pylon chat settings on updateUserInfo', () => {
    const { result } = renderHook(() => useSupportChat())

    result.current.updateUserInfo({ name: 'Override Name' })

    expect(window.pylon?.chat_settings).toMatchObject({ name: 'Override Name' })
  })
})
