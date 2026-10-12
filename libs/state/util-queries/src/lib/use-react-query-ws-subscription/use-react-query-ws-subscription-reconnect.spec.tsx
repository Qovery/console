import { act, renderHook } from '@testing-library/react'
import useReactQueryWsSubscription from './use-react-query-ws-subscription'

const mockGetToken = jest.fn()

jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({ getAccessTokenSilently: mockGetToken }),
}))
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({}),
}))

describe('websocket reconnection', () => {
  const originalWebSocket = global.WebSocket
  let sockets: WebSocket[]

  beforeEach(() => {
    jest.useFakeTimers()
    sockets = []
    mockGetToken.mockReset().mockResolvedValue('token')
    global.WebSocket = jest.fn(() => {
      const socket = { close: jest.fn() } as unknown as WebSocket
      sockets.push(socket)
      return socket
    }) as unknown as typeof WebSocket
  })

  afterEach(() => {
    global.WebSocket = originalWebSocket
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  async function advance(ms: number) {
    await act(async () => {
      jest.advanceTimersByTime(ms)
    })
  }

  it('reports disconnection during retries, caps delays and resets backoff after fresh data', async () => {
    const onDisconnect = jest.fn()
    const onClose = jest.fn()
    const { unmount } = renderHook(() =>
      useReactQueryWsSubscription({
        url: 'ws://localhost/status',
        shouldReconnect: true,
        maxReconnectDelay: 10_000,
        onDisconnect,
        onClose,
      })
    )
    await advance(0)
    const close = () => {
      const socket = sockets[sockets.length - 1]
      socket.onclose?.call(socket, new CloseEvent('close', { reason: 'NotFound' }))
    }

    close()
    expect(onDisconnect).toHaveBeenCalledTimes(1)
    expect(onClose).not.toHaveBeenCalled()
    await advance(5_000)
    expect(sockets).toHaveLength(2)
    close()
    await advance(10_000)
    expect(sockets).toHaveLength(3)
    close()
    await advance(10_000)
    expect(sockets).toHaveLength(4)

    const recovered = sockets[3]
    recovered.onmessage?.call(recovered, new MessageEvent('message', { data: '{}' }))
    close()
    await advance(5_000)
    expect(sockets).toHaveLength(5)
    unmount()
    await advance(90_000)
    expect(sockets).toHaveLength(5)
  })

  it('retries rejected token acquisition and recovers without remounting', async () => {
    const onConnectionError = jest.fn()
    const { unmount } = renderHook(() =>
      useReactQueryWsSubscription({ url: 'ws://localhost/status', shouldReconnect: true, onConnectionError })
    )
    await advance(0)
    mockGetToken.mockRejectedValueOnce(new Error('Network unavailable'))
    sockets[0].onclose?.call(sockets[0], new CloseEvent('close'))
    await advance(5_000)
    expect(onConnectionError).toHaveBeenCalledTimes(1)
    expect(sockets).toHaveLength(1)
    await advance(10_000)
    expect(sockets).toHaveLength(2)
    unmount()
  })

  it('respects finite retry limits for setup failures', async () => {
    mockGetToken.mockRejectedValue(new Error('Network unavailable'))
    const { unmount } = renderHook(() =>
      useReactQueryWsSubscription({ url: 'ws://localhost/status', shouldReconnect: 2 })
    )
    await advance(0)
    await advance(5_000)
    await advance(10_000)
    await advance(100_000)
    expect(mockGetToken).toHaveBeenCalledTimes(3)
    expect(sockets).toHaveLength(0)
    unmount()
  })

  it('does not retry authentication errors requiring user interaction', async () => {
    mockGetToken.mockRejectedValue({ error: 'login_required' })
    const { unmount } = renderHook(() =>
      useReactQueryWsSubscription({ url: 'ws://localhost/status', shouldReconnect: true })
    )
    await advance(0)
    await advance(100_000)
    expect(mockGetToken).toHaveBeenCalledTimes(1)
    unmount()
  })

  it('cancels setup retries on unmount', async () => {
    mockGetToken.mockRejectedValue(new Error('Network unavailable'))
    const { unmount } = renderHook(() =>
      useReactQueryWsSubscription({ url: 'ws://localhost/status', shouldReconnect: true })
    )
    await advance(0)
    unmount()
    await advance(100_000)
    expect(mockGetToken).toHaveBeenCalledTimes(1)
  })

  it('does not report intentional cleanup as a disconnect or keep retrying', async () => {
    const onDisconnect = jest.fn()
    const { unmount } = renderHook(() =>
      useReactQueryWsSubscription({ url: 'ws://localhost/status', shouldReconnect: true, onDisconnect })
    )
    await advance(0)
    const socket = sockets[0]
    unmount()
    socket.onclose?.call(socket, new CloseEvent('close'))
    await advance(90_000)
    expect(onDisconnect).not.toHaveBeenCalled()
    expect(sockets).toHaveLength(1)
  })
})
