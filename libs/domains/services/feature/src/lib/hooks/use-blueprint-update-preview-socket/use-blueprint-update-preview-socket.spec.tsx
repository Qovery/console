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

describe('useBlueprintUpdatePreviewSocket', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should subscribe to the blueprint preview endpoint with organization, cluster and preview id', () => {
    renderHook(() =>
      useBlueprintUpdatePreviewSocket({
        organizationId: 'org-1',
        clusterId: 'cluster-1',
        previewId: 'preview-1',
      })
    )

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

  it('should expose raw output from a diff result', () => {
    const { result } = renderHook(() =>
      useBlueprintUpdatePreviewSocket({
        organizationId: 'org-1',
        clusterId: 'cluster-1',
        previewId: 'preview-1',
      })
    )
    const subscriptionConfig = useReactQueryWsSubscriptionMock.mock.calls[0]?.[0]

    act(() => {
      subscriptionConfig?.onOpen?.({} as QueryClient, {} as Event)
      expect(result.current.hasReceivedMessage).toBe(false)
      subscriptionConfig?.onMessage?.({} as QueryClient, {
        type: 'diff',
        payload: '# Terraform will perform the following actions:',
        service_type: 'TERRAFORM',
      })
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.hasReceivedMessage).toBe(true)
    expect(result.current.rawOutput).toBe('# Terraform will perform the following actions:')
  })

  it.each([{ type: 'error', message: 'Preview failed' }, { type: 'cancelled' }, { type: 'timeout' }])(
    'should complete without raw output for a $type result',
    (message) => {
      const { result } = renderHook(() =>
        useBlueprintUpdatePreviewSocket({
          organizationId: 'org-1',
          clusterId: 'cluster-1',
          previewId: 'preview-1',
        })
      )
      const subscriptionConfig = useReactQueryWsSubscriptionMock.mock.calls[0]?.[0]

      act(() => {
        subscriptionConfig?.onMessage?.({} as QueryClient, message)
      })

      expect(result.current.rawOutput).toBe('')
      expect(result.current.hasReceivedMessage).toBe(true)
    }
  )

  it('should reset message state when preview id changes', () => {
    const { result, rerender } = renderHook(
      ({ previewId }) =>
        useBlueprintUpdatePreviewSocket({
          organizationId: 'org-1',
          clusterId: 'cluster-1',
          previewId,
        }),
      { initialProps: { previewId: 'preview-1' } }
    )
    const subscriptionConfig = useReactQueryWsSubscriptionMock.mock.calls[0]?.[0]

    act(() => {
      subscriptionConfig?.onMessage?.({} as QueryClient, {
        type: 'diff',
        payload: '# output',
        service_type: 'TERRAFORM',
      })
    })

    expect(result.current.hasReceivedMessage).toBe(true)

    rerender({ previewId: 'preview-2' })

    expect(result.current.hasReceivedMessage).toBe(false)
    expect(result.current.rawOutput).toBe('')
  })

  it('should keep websocket lifecycle handlers stable after state updates', () => {
    renderHook(() =>
      useBlueprintUpdatePreviewSocket({
        organizationId: 'org-1',
        clusterId: 'cluster-1',
        previewId: 'preview-1',
      })
    )
    const subscriptionConfig = useReactQueryWsSubscriptionMock.mock.calls[0]?.[0]

    act(() => {
      subscriptionConfig?.onOpen?.({} as QueryClient, {} as Event)
    })

    const nextSubscriptionConfig = useReactQueryWsSubscriptionMock.mock.calls.at(-1)?.[0]
    expect(nextSubscriptionConfig?.onOpen).toBe(subscriptionConfig?.onOpen)
    expect(nextSubscriptionConfig?.onError).toBe(subscriptionConfig?.onError)
    expect(nextSubscriptionConfig?.onClose).toBe(subscriptionConfig?.onClose)
    expect(nextSubscriptionConfig?.onMessage).toBe(subscriptionConfig?.onMessage)
  })
})
