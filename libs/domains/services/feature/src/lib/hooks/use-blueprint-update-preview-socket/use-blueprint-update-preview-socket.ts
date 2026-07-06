import { type QueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'

export type BlueprintUpdatePreviewImpactLevel = 'low' | 'medium' | 'high' | 'unknown'

export interface BlueprintUpdatePreviewImpact {
  level: BlueprintUpdatePreviewImpactLevel
  description: string[]
  impactedServices: string[]
}

export interface BlueprintUpdatePreviewSocketData {
  impact?: BlueprintUpdatePreviewImpact
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

type PreviewSocketObjectMessage = Record<string, unknown>

export function useBlueprintUpdatePreviewSocket({
  organizationId,
  clusterId,
  previewId,
  enabled = true,
}: UseBlueprintUpdatePreviewSocketProps): BlueprintUpdatePreviewSocketData {
  const [impact, setImpact] = useState<BlueprintUpdatePreviewImpact>()
  const [rawOutput, setRawOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [hasReceivedMessage, setHasReceivedMessage] = useState(false)

  useEffect(() => {
    setImpact(undefined)
    setRawOutput('')
    setIsLoading(false)
    setHasError(false)
    setHasReceivedMessage(false)
  }, [clusterId, organizationId, previewId])

  const appendRawOutput = useCallback((nextRawOutput: string) => {
    setRawOutput((currentRawOutput) => {
      if (!currentRawOutput) return nextRawOutput
      return `${currentRawOutput}${nextRawOutput.startsWith('\n') ? '' : '\n'}${nextRawOutput}`
    })
  }, [])

  const handleMessage = useCallback(
    (_: QueryClient, message: unknown) => {
      setIsLoading(false)
      setHasReceivedMessage(true)

      const nextImpact = getPreviewImpact(message)
      if (nextImpact) {
        setImpact(nextImpact)
      }

      const nextRawOutput = getPreviewRawOutput(message)
      if (nextRawOutput) {
        appendRawOutput(nextRawOutput)
      }
    },
    [appendRawOutput]
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
    impact,
    rawOutput,
    isLoading,
    hasError,
    hasReceivedMessage,
  }
}

function getPreviewImpact(message: unknown): BlueprintUpdatePreviewImpact | undefined {
  const payload = getObjectMessage(message)
  if (!payload) return undefined

  const impactPayload = getObjectValue(payload, 'deployment_impact') ?? getObjectValue(payload, 'deploymentImpact')
  const source = impactPayload ?? (isImpactMessage(payload) ? payload : undefined)
  if (!source) return undefined

  const description = getStringArrayValue(source, 'description')
    .concat(getStringArrayValue(source, 'summary'))
    .concat(getStringArrayValue(source, 'message'))
  const impactedServices =
    getStringArrayValue(source, 'impacted_services').length > 0
      ? getStringArrayValue(source, 'impacted_services')
      : getStringArrayValue(source, 'impactedServices').concat(getStringArrayValue(source, 'services'))

  return {
    level: getImpactLevel(source),
    description,
    impactedServices,
  }
}

function getPreviewRawOutput(message: unknown): string | undefined {
  if (typeof message === 'string') return message

  const payload = getObjectMessage(message)
  if (!payload) return undefined

  const rawOutput =
    getStringValue(payload, 'payload') ??
    getStringValue(payload, 'raw_output') ??
    getStringValue(payload, 'rawOutput') ??
    getStringValue(payload, 'output') ??
    getStringValue(payload, 'line') ??
    getStringValue(payload, 'log')

  if (rawOutput) return rawOutput

  const messageValue = getStringValue(payload, 'message')
  const type = getStringValue(payload, 'type') ?? getStringValue(payload, 'event')
  if (messageValue && type && /raw|output|log/i.test(type)) {
    return messageValue
  }

  const logs = getStringArrayValue(payload, 'logs')
  return logs.length > 0 ? logs.join('\n') : undefined
}

function getObjectMessage(message: unknown): PreviewSocketObjectMessage | undefined {
  if (!message || typeof message !== 'object' || Array.isArray(message)) {
    return undefined
  }

  return message as PreviewSocketObjectMessage
}

function getObjectValue(payload: PreviewSocketObjectMessage, key: string): PreviewSocketObjectMessage | undefined {
  const value = payload[key]
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined
  }

  return value as PreviewSocketObjectMessage
}

function getStringValue(payload: PreviewSocketObjectMessage, key: string): string | undefined {
  const value = payload[key]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function getStringArrayValue(payload: PreviewSocketObjectMessage, key: string): string[] {
  const value = payload[key]
  if (typeof value === 'string' && value.length > 0) {
    return value.split('\n\n').filter(Boolean)
  }
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.length > 0)
  }

  return []
}

function getImpactLevel(payload: PreviewSocketObjectMessage): BlueprintUpdatePreviewImpactLevel {
  const level =
    getStringValue(payload, 'level') ?? getStringValue(payload, 'severity') ?? getStringValue(payload, 'impact')

  if (!level) return 'unknown'

  const normalizedLevel = level.toLowerCase()
  if (normalizedLevel.includes('high')) return 'high'
  if (normalizedLevel.includes('medium')) return 'medium'
  if (normalizedLevel.includes('low')) return 'low'
  return 'unknown'
}

function isImpactMessage(payload: PreviewSocketObjectMessage): boolean {
  const type = getStringValue(payload, 'type') ?? getStringValue(payload, 'event')
  return Boolean(type && /impact|summary|analysis/i.test(type))
}

export default useBlueprintUpdatePreviewSocket
