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

  it('should not subscribe until all params are available', () => {
    renderHook(() =>
      useBlueprintUpdatePreviewSocket({
        organizationId: 'org-1',
        previewId: 'preview-1',
      })
    )

    expect(useReactQueryWsSubscriptionMock).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }))
  })

  it('should expose deployment impact and raw output from socket messages', () => {
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
        deployment_impact: {
          severity: 'high',
          description: [
            'Upgrading engine_version forces a full recreation on AWS.',
            'Verify your database endpoint before confirming.',
          ],
          impacted_services: ['Postgres database', 'Redis cache'],
        },
        raw_output: '# Terraform will perform the following actions:',
      })
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.hasReceivedMessage).toBe(true)
    expect(result.current.impact).toEqual({
      level: 'high',
      description: [
        'Upgrading engine_version forces a full recreation on AWS.',
        'Verify your database endpoint before confirming.',
      ],
      impactedServices: ['Postgres database', 'Redis cache'],
    })
    expect(result.current.rawOutput).toBe('# Terraform will perform the following actions:')
  })

  it('should append plain text output chunks', () => {
    const { result } = renderHook(() =>
      useBlueprintUpdatePreviewSocket({
        organizationId: 'org-1',
        clusterId: 'cluster-1',
        previewId: 'preview-1',
      })
    )
    const subscriptionConfig = useReactQueryWsSubscriptionMock.mock.calls[0]?.[0]

    act(() => {
      subscriptionConfig?.onMessage?.({} as QueryClient, '# first line')
      subscriptionConfig?.onMessage?.({} as QueryClient, '# second line')
    })

    expect(result.current.rawOutput).toBe('# first line\n# second line')
    expect(result.current.hasReceivedMessage).toBe(true)
  })

  it('should use the payload property as raw output', () => {
    const { result } = renderHook(() =>
      useBlueprintUpdatePreviewSocket({
        organizationId: 'org-1',
        clusterId: 'cluster-1',
        previewId: 'preview-1',
      })
    )
    const subscriptionConfig = useReactQueryWsSubscriptionMock.mock.calls[0]?.[0]

    act(() => {
      subscriptionConfig?.onMessage?.({} as QueryClient, {
        type: 'diff',
        payload: '\nTerraform will perform the following actions:\n\n  # aws_db_instance.this will be created',
        service_type: 'TERRAFORM',
      })
    })

    expect(result.current.rawOutput).toBe(
      '\nTerraform will perform the following actions:\n\n  # aws_db_instance.this will be created'
    )
    expect(result.current.hasReceivedMessage).toBe(true)
  })

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
      subscriptionConfig?.onMessage?.({} as QueryClient, '# output')
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
