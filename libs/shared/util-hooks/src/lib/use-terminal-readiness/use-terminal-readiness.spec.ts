import { act, renderHook } from '@testing-library/react'
import { useTerminalReadiness } from './use-terminal-readiness'

class MockWebSocket {
  private readonly listeners = new Map<string, Set<(event: { data: Blob | ArrayBuffer | string }) => void>>()

  addEventListener(type: string, listener: (event: { data: Blob | ArrayBuffer | string }) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }

    this.listeners.get(type)?.add(listener)
  }

  removeEventListener(type: string, listener: (event: { data: Blob | ArrayBuffer | string }) => void) {
    this.listeners.get(type)?.delete(listener)
  }

  emitMessage(data: Blob | ArrayBuffer | string) {
    this.listeners.get('message')?.forEach((listener) => listener({ data }))
  }
}

async function emitTerminalMessage(websocket: MockWebSocket, data: Blob | ArrayBuffer | string) {
  await act(async () => {
    websocket.emitMessage(data)
    await Promise.resolve()
  })
}

describe('useTerminalReadiness', () => {
  it('marks the terminal as ready when the prompt is reconstructed across messages', async () => {
    const { result } = renderHook(() => useTerminalReadiness({ readyPrompt: '/ #' }))
    const websocket = new MockWebSocket()

    act(() => {
      result.current.attachWebSocket(websocket as unknown as WebSocket)
    })

    expect(result.current.isTerminalReady).toBe(false)

    await emitTerminalMessage(websocket, 'Welcome \u001b[32m/ ')
    expect(result.current.isTerminalReady).toBe(false)

    await emitTerminalMessage(websocket, '\r#\u001b[0m')
    expect(result.current.isTerminalReady).toBe(true)
  })

  it('decodes binary websocket payloads before matching the prompt', async () => {
    const { result } = renderHook(() => useTerminalReadiness({ readyPrompt: '/ #' }))
    const websocket = new MockWebSocket()

    act(() => {
      result.current.attachWebSocket(websocket as unknown as WebSocket)
    })

    await emitTerminalMessage(websocket, new Uint8Array([47, 32, 35]).buffer)

    expect(result.current.isTerminalReady).toBe(true)
  })

  it('resets readiness when requested explicitly', async () => {
    const { result } = renderHook(() => useTerminalReadiness({ readyPrompt: '/ #' }))
    const websocket = new MockWebSocket()

    act(() => {
      result.current.attachWebSocket(websocket as unknown as WebSocket)
    })

    await emitTerminalMessage(websocket, '/ #')
    expect(result.current.isTerminalReady).toBe(true)

    act(() => {
      result.current.resetTerminalReadiness()
    })

    expect(result.current.isTerminalReady).toBe(false)
  })

  it('detaches the previous websocket listener before observing a new connection', async () => {
    const { result } = renderHook(() => useTerminalReadiness({ readyPrompt: '/ #' }))
    const firstWebSocket = new MockWebSocket()
    const secondWebSocket = new MockWebSocket()

    act(() => {
      result.current.attachWebSocket(firstWebSocket as unknown as WebSocket)
    })

    await emitTerminalMessage(firstWebSocket, '/ #')
    expect(result.current.isTerminalReady).toBe(true)

    act(() => {
      result.current.attachWebSocket(secondWebSocket as unknown as WebSocket)
    })

    expect(result.current.isTerminalReady).toBe(false)

    await emitTerminalMessage(firstWebSocket, '/ #')
    expect(result.current.isTerminalReady).toBe(false)

    await emitTerminalMessage(secondWebSocket, '/ #')
    expect(result.current.isTerminalReady).toBe(true)
  })
})
