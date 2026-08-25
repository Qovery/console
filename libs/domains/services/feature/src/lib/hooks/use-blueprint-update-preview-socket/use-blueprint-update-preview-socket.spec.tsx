import { type QueryClient } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import { useBlueprintUpdatePreviewSocket } from './use-blueprint-update-preview-socket'

jest.mock('@qovery/shared/util-node-env', () => ({
  QOVERY_WS: 'wss://ws.qovery.com',
}))

jest.mock('@qovery/state/util-queries', () => ({
  useReactQueryWsSubscription: jest.fn(),
}))

const useReactQueryWsSubscriptionMock = jest.mocked(useReactQueryWsSubscription)

function renderPreviewSocket() {
  const { result, rerender } = renderHook(
    ({ previewId }) =>
      useBlueprintUpdatePreviewSocket({
        organizationId: 'org-1',
        clusterId: 'cluster-1',
        previewId,
      }),
    { initialProps: { previewId: 'preview-1' } }
  )

  return { result, rerender, config: () => useReactQueryWsSubscriptionMock.mock.calls.at(-1)?.[0] }
}

describe('useBlueprintUpdatePreviewSocket', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should subscribe to the blueprint preview endpoint with organization, cluster and preview id', () => {
    renderPreviewSocket()

    expect(useReactQueryWsSubscriptionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'wss://ws.qovery.com/blueprint/preview',
        urlSearchParams: {
          organization: 'org-1',
          cluster: 'cluster-1',
          preview_id: 'preview-1',
        },
        enabled: true,
      })
    )
  })

  it('should stay pending until a frame arrives', () => {
    const { result } = renderPreviewSocket()

    expect(result.current.outcome).toEqual({ type: 'pending' })
  })

  it('should expose raw output from a diff result', () => {
    const { result, config } = renderPreviewSocket()

    act(() => {
      config()?.onMessage?.({} as QueryClient, {
        type: 'diff',
        payload: '# Terraform will perform the following actions:',
        service_type: 'TERRAFORM',
      })
    })

    expect(result.current.outcome).toEqual({
      type: 'diff',
      rawOutput: '# Terraform will perform the following actions:',
    })
  })

  it.each(['', '   \n  '])('should report no-changes for a diff with a blank payload (%j)', (payload) => {
    const { result, config } = renderPreviewSocket()

    act(() => {
      config()?.onMessage?.({} as QueryClient, { type: 'diff', payload, service_type: 'TERRAFORM' })
    })

    expect(result.current.outcome).toEqual({ type: 'no-changes' })
  })

  it('should surface the message of an error result', () => {
    const { result, config } = renderPreviewSocket()

    act(() => {
      config()?.onMessage?.({} as QueryClient, { type: 'error', message: 'terraform init failed' })
    })

    expect(result.current.outcome).toEqual({ type: 'error', message: 'terraform init failed' })
  })

  it.each([{ type: 'cancelled' }, { type: 'timeout' }] as const)('should settle on the $type outcome', ({ type }) => {
    const { result, config } = renderPreviewSocket()

    act(() => {
      config()?.onMessage?.({} as QueryClient, { type })
    })

    expect(result.current.outcome).toEqual({ type })
  })

  it('should fail fast when the socket closes before any frame', () => {
    const { result, config } = renderPreviewSocket()

    act(() => {
      config()?.onClose?.({} as QueryClient, {} as CloseEvent)
    })

    expect(result.current.outcome).toEqual({ type: 'error' })
  })

  it('should keep the first outcome when the socket closes after a frame', () => {
    const { result, config } = renderPreviewSocket()

    act(() => {
      config()?.onMessage?.({} as QueryClient, { type: 'diff', payload: '# output', service_type: 'TERRAFORM' })
      config()?.onClose?.({} as QueryClient, {} as CloseEvent)
    })

    expect(result.current.outcome).toEqual({ type: 'diff', rawOutput: '# output' })
  })

  it('should time out instead of waiting forever when no frame ever arrives', () => {
    jest.useFakeTimers()
    const { result } = renderPreviewSocket()

    expect(result.current.outcome).toEqual({ type: 'pending' })

    act(() => {
      jest.advanceTimersByTime(12 * 60 * 1000)
    })

    expect(result.current.outcome).toEqual({ type: 'timeout' })
  })

  it('should reset to pending when preview id changes', () => {
    const { result, rerender, config } = renderPreviewSocket()

    act(() => {
      config()?.onMessage?.({} as QueryClient, { type: 'diff', payload: '# output', service_type: 'TERRAFORM' })
    })

    expect(result.current.outcome).toEqual({ type: 'diff', rawOutput: '# output' })

    rerender({ previewId: 'preview-2' })

    expect(result.current.outcome).toEqual({ type: 'pending' })
  })

  it('should keep websocket lifecycle handlers stable after state updates', () => {
    const { config } = renderPreviewSocket()
    const initial = config()

    act(() => {
      initial?.onMessage?.({} as QueryClient, { type: 'cancelled' })
    })

    expect(config()?.onError).toBe(initial?.onError)
    expect(config()?.onClose).toBe(initial?.onClose)
    expect(config()?.onMessage).toBe(initial?.onMessage)
  })
})
