import { type QueryClient } from '@tanstack/react-query'
import { type BlueprintPreviewResult } from 'qovery-ws-typescript-axios'
import { useCallback, useEffect, useState } from 'react'
import { match } from 'ts-pattern'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'

export interface BlueprintUpdatePreviewSocketData {
  rawOutput: string
  isLoading: boolean
  hasError: boolean
  hasReceivedMessage: boolean
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
  const [rawOutput, setRawOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [hasReceivedMessage, setHasReceivedMessage] = useState(false)

  useEffect(() => {
    setRawOutput('')
    setIsLoading(false)
    setHasError(false)
    setHasReceivedMessage(false)
  }, [clusterId, organizationId, previewId])

  const handleMessage = useCallback(
    (_: QueryClient, message: BlueprintPreviewResult) => {
      setIsLoading(false)
      setHasReceivedMessage(true)

      match(message)
        .with({ type: 'diff' }, ({ payload }) => setRawOutput(payload))
        .otherwise(() => undefined)
    },
    []
  )

  const handleOpen = useCallback(() => {
    setIsLoading(true)
    setHasError(false)
  }, [])

  const handleError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
  }, [])

  const handleClose = useCallback(() => {
    setIsLoading(false)
  }, [])

  useReactQueryWsSubscription({
    url: QOVERY_WS + '/blueprint/preview',
    urlSearchParams: {
      organization: organizationId,
      cluster: clusterId,
      preview_id: previewId,
    },
    enabled: enabled && Boolean(organizationId) && Boolean(clusterId) && Boolean(previewId),
    onOpen: handleOpen,
    onMessage: handleMessage,
    onError: handleError,
    onClose: handleClose,
  })

  return {
    rawOutput,
    isLoading,
    hasError,
    hasReceivedMessage,
  }
}

export default useBlueprintUpdatePreviewSocket
