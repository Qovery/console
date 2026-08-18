import { useQueryClient } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import WS from 'jest-websocket-mock'
import useReactQueryWsSubscription from './use-react-query-ws-subscription'

jest.mock('@tanstack/react-query', () => {
  const queryClient = {
    invalidateQueries: jest.fn(),
  }
  return {
    ...jest.requireActual('@tanstack/react-query'),
    useQueryClient: () => queryClient,
  }
})

jest.mock('@auth0/auth0-react', () => ({
  ...jest.requireActual('@auth0/auth0-react'),
  useAuth0: () => ({
    getAccessTokenSilently: () => Promise.resolve('my-secret-token'),
  }),
}))

describe('useReactQueryWsSubscription', () => {
  let server: WS

  beforeEach(() => {
    jest.clearAllMocks()
    server = new WS('ws://localhost:1234', { jsonProtocol: true })
  })

  afterEach(() => {
    server.close()
  })

  it('should connect to the given url using bearer token', async () => {
    const { unmount } = renderHook(() =>
      useReactQueryWsSubscription({ url: 'ws://localhost:1234', onMessage: jest.fn() })
    )

    const connection = await server.connected
    expect([WebSocket.CONNECTING, WebSocket.OPEN]).toContain(connection.readyState)
    expect(connection.url).toBe('ws://localhost:1234/?')
    // Bearer token value cannot be verify with `connection` object
    expect(connection.protocol).toBe('v1')

    connection.close()
    unmount()
  })

  it('should connect to the given url using bearer token and custom params', async () => {
    const { unmount } = renderHook(() =>
      useReactQueryWsSubscription({
        url: 'ws://localhost:1234',
        urlSearchParams: {
          foo: 'bar',
          baz: '1',
          bar: undefined,
          qux: '',
        },
        onMessage: jest.fn(),
      })
    )

    const connection = await server.connected
    expect([WebSocket.CONNECTING, WebSocket.OPEN]).toContain(connection.readyState)
    expect(connection.url).toBe('ws://localhost:1234/?foo=bar&baz=1')
    // Bearer token value cannot be verify with `connection` object
    expect(connection.protocol).toBe('v1')

    connection.close()
    unmount()
  })

  it('should invalidate query keys on invalidate operation message', async () => {
    const onQueryInvalidated = jest.fn()
    const { unmount } = renderHook(() =>
      useReactQueryWsSubscription({ url: 'ws://localhost:1234', onMessage: jest.fn(), onQueryInvalidated })
    )
    const queryClient = useQueryClient()
    const connection = await server.connected

    server.send({ entity: ['projects', 'list'] })

    expect(queryClient.invalidateQueries).toHaveBeenNthCalledWith(1, { queryKey: ['projects', 'list'] })
    expect(onQueryInvalidated).toHaveBeenCalledWith(queryClient, { entity: ['projects', 'list'] })
    connection.close()
    unmount()
  })

  it('should call onMessage handler when message format is unknown', async () => {
    const onMessage = jest.fn()
    const { unmount } = renderHook(() => useReactQueryWsSubscription({ url: 'ws://localhost:1234', onMessage }))
    const queryClient = useQueryClient()
    const connection = await server.connected

    server.send({ foo: 'bar' })

    expect(queryClient.invalidateQueries).not.toHaveBeenCalled()
    expect(onMessage).toHaveBeenNthCalledWith(1, queryClient, { foo: 'bar' })
    connection.close()
    unmount()
  })

  it('should call onMessage handler with plain text messages', async () => {
    server.close()
    server = new WS('ws://localhost:4321')
    const onMessage = jest.fn()
    const { unmount } = renderHook(() => useReactQueryWsSubscription({ url: 'ws://localhost:4321', onMessage }))
    const queryClient = useQueryClient()
    const connection = await server.connected

    server.send('raw output line')

    expect(queryClient.invalidateQueries).not.toHaveBeenCalled()
    expect(onMessage).toHaveBeenNthCalledWith(1, queryClient, 'raw output line')
    connection.close()
    unmount()
  })

  it('should keep the current socket open when an event handler changes', async () => {
    const initialOnMessage = jest.fn()
    const updatedOnMessage = jest.fn()
    const { rerender, unmount } = renderHook(
      ({ onMessage }) => useReactQueryWsSubscription({ url: 'ws://localhost:1234', onMessage }),
      { initialProps: { onMessage: initialOnMessage } }
    )
    const connection = await server.connected

    rerender({ onMessage: updatedOnMessage })

    expect(connection.readyState).toBe(WebSocket.OPEN)
    server.send('message after handler update')
    expect(updatedOnMessage).toHaveBeenCalledWith(useQueryClient(), 'message after handler update')
    expect(initialOnMessage).not.toHaveBeenCalled()
    unmount()
  })

  it('should do nothing when not enabled', async () => {
    const onMessage = jest.fn()
    const { unmount } = renderHook(() =>
      useReactQueryWsSubscription({ url: 'ws://localhost:1234', onMessage, enabled: false })
    )
    const queryClient = useQueryClient()

    server.send({ foo: 'bar' })

    expect(queryClient.invalidateQueries).not.toHaveBeenCalled()
    expect(onMessage).not.toHaveBeenCalled()
    unmount()
  })

  it('should close connection on unmount', async () => {
    const onMessage = jest.fn()
    const { unmount } = renderHook(() => useReactQueryWsSubscription({ url: 'ws://localhost:1234', onMessage }))
    const connection = await server.connected

    unmount()

    expect([WebSocket.CLOSED, WebSocket.CLOSING]).toContain(connection.readyState)
  })

  it('should not call onClose when the component cleans up its own socket', async () => {
    const onClose = jest.fn()
    const { unmount } = renderHook(() => useReactQueryWsSubscription({ url: 'ws://localhost:1234', onClose }))
    await server.connected

    unmount()
    await server.closed

    expect(onClose).not.toHaveBeenCalled()
  })
})
