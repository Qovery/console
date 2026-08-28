import { type QueryClient } from '@tanstack/react-query'
import { type BlueprintPreviewResult } from 'qovery-ws-typescript-axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { match } from 'ts-pattern'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'

// The gateway gives up after 11min and sends its own timeout frame; this only catches a socket
// that dies without ever delivering one, so the UI can never wait forever.
const PREVIEW_WATCHDOG_MS = 12 * 60 * 1000

/**
 * The backend sends exactly one frame then closes, so the preview always settles on a single
 * terminal outcome. `pending` is the only state that may render a spinner.
 */
export type BlueprintUpdatePreviewOutcome =
  | { type: 'pending' }
  | { type: 'diff'; rawOutput: string }
  | { type: 'no-changes' }
  | { type: 'error'; message?: string }
  | { type: 'cancelled' }
  // `message` is absent when nothing reported a reason: the watchdog below, or a gateway frame.
  | { type: 'timeout'; message?: string }

export interface BlueprintUpdatePreviewSocketData {
  outcome: BlueprintUpdatePreviewOutcome
}

export interface UseBlueprintUpdatePreviewSocketProps {
  organizationId?: string
  clusterId?: string
  previewId?: string
  enabled?: boolean
}

export function useBlueprintUpdatePreviewSocket({
  organizationId,
  clusterId,
  previewId,
  enabled = true,
}: UseBlueprintUpdatePreviewSocketProps): BlueprintUpdatePreviewSocketData {
  const [outcome, setOutcome] = useState<BlueprintUpdatePreviewOutcome>({ type: 'pending' })
  const outcomeRef = useRef<BlueprintUpdatePreviewOutcome>(outcome)

  // First terminal outcome wins — a close event must not overwrite the frame that preceded it.
  const settle = useCallback((next: BlueprintUpdatePreviewOutcome) => {
    if (outcomeRef.current.type !== 'pending') return
    outcomeRef.current = next
    setOutcome(next)
  }, [])

  const isSubscribed = enabled && Boolean(organizationId) && Boolean(clusterId) && Boolean(previewId)

  useEffect(() => {
    outcomeRef.current = { type: 'pending' }
    setOutcome({ type: 'pending' })
  }, [clusterId, organizationId, previewId])

  useEffect(() => {
    if (!isSubscribed || outcome.type !== 'pending') return

    const timeoutId = window.setTimeout(() => settle({ type: 'timeout' }), PREVIEW_WATCHDOG_MS)
    return () => window.clearTimeout(timeoutId)
  }, [isSubscribed, outcome.type, settle])

  const handleMessage = useCallback(
    (_: QueryClient, message: BlueprintPreviewResult) => {
      settle(
        match<BlueprintPreviewResult, BlueprintUpdatePreviewOutcome>(message)
          .with({ type: 'diff' }, ({ payload }) =>
            payload?.trim() ? { type: 'diff', rawOutput: payload } : { type: 'no-changes' }
          )
          .with({ type: 'error' }, ({ message: reason }) => ({ type: 'error', message: reason }))
          .with({ type: 'cancelled' }, () => ({ type: 'cancelled' }))
          .with({ type: 'timeout' }, ({ message }) => ({ type: 'timeout', message: message ?? undefined }))
          .exhaustive()
      )
    },
    [settle]
  )

  const handleError = useCallback(() => settle({ type: 'error' }), [settle])

  // Reconnection is off, so a close before any frame means the result will never arrive.
  const handleClose = useCallback(() => settle({ type: 'error' }), [settle])

  useReactQueryWsSubscription({
    url: QOVERY_WS + '/blueprint/preview',
    urlSearchParams: {
      organization: organizationId,
      cluster: clusterId,
      preview_id: previewId,
    },
    enabled: isSubscribed,
    onMessage: handleMessage,
    onError: handleError,
    onClose: handleClose,
  })

  return { outcome }
}

export default useBlueprintUpdatePreviewSocket
