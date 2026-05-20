import { useQuery } from '@tanstack/react-query'
import type { GetClusterKubernetesEvents200ResponseResultsInner } from 'qovery-typescript-axios'
import { useMemo } from 'react'
import { observability } from '@qovery/domains/observability/data-access'
import type { ReferenceLineEvent } from '../../local-chart/local-chart'

const WINDOW_MS = 2 * 60 * 60 * 1000

interface KubernetesEventApiResponse extends GetClusterKubernetesEvents200ResponseResultsInner {
  createdAt?: string
  firstOccurrence?: string
  lastOccurrence?: string
  reportingComponent?: string
}

export interface KubernetesEventDetail extends KubernetesEventApiResponse {
  distance: number
  timestamp: number
}

export interface UseKubernetesEventDetailsProps {
  clusterId: string
  serviceId: string
  event: ReferenceLineEvent
}

function parseIsoTimestamp(timestamp?: string): number | undefined {
  if (!timestamp) return undefined
  const parsed = new Date(timestamp).getTime()
  return Number.isFinite(parsed) ? parsed : undefined
}

function getShortServiceId(serviceId: string): string {
  return serviceId.split('-')[0]
}

function getEventTimestamp(event: KubernetesEventApiResponse): number | undefined {
  return (
    parseIsoTimestamp(event.lastOccurrence ?? event.last_occurrence) ??
    parseIsoTimestamp(event.firstOccurrence ?? event.first_occurrence) ??
    parseIsoTimestamp(event.createdAt ?? event.created_at)
  )
}

function hasServiceHint(event: KubernetesEventApiResponse, serviceId: string): boolean {
  const shortServiceId = getShortServiceId(serviceId)
  const name = event.name ?? ''
  return Boolean(shortServiceId && (name.includes(shortServiceId) || name.includes(`z${shortServiceId}`)))
}

function findNearestKubernetesEvent(
  events: KubernetesEventApiResponse[] | undefined,
  event: ReferenceLineEvent,
  serviceId: string
): KubernetesEventDetail | undefined {
  if (!events?.length) return undefined

  const candidates = events.filter((kubernetesEvent) => {
    const hasMatchingReason = kubernetesEvent.reason === event.reason
    const isPodEvent = !kubernetesEvent.kind || kubernetesEvent.kind === 'Pod'
    return hasMatchingReason && isPodEvent && getEventTimestamp(kubernetesEvent)
  })

  const serviceCandidates = candidates.filter((kubernetesEvent) => hasServiceHint(kubernetesEvent, serviceId))
  const pool = serviceCandidates.length > 0 ? serviceCandidates : candidates

  return pool
    .map((kubernetesEvent) => {
      const timestamp = getEventTimestamp(kubernetesEvent) ?? event.timestamp
      return {
        ...kubernetesEvent,
        distance: Math.abs(timestamp - event.timestamp),
        timestamp,
      }
    })
    .sort((a, b) => a.distance - b.distance)[0]
}

export function useKubernetesEventDetails({ clusterId, serviceId, event }: UseKubernetesEventDetailsProps) {
  const fromDateTime = new Date(event.timestamp - WINDOW_MS).toISOString()
  const toDateTime = new Date(event.timestamp + WINDOW_MS).toISOString()
  const podName = getShortServiceId(serviceId)

  const { data } = useQuery({
    ...observability.kubernetesEvents({
      clusterId,
      fromDateTime,
      toDateTime,
      podName,
    }),
    staleTime: 60_000,
    suspense: true,
  })

  const detail = useMemo(() => findNearestKubernetesEvent(data, event, serviceId), [data, event, serviceId])

  return {
    detail,
    firstOccurrence: detail?.firstOccurrence ?? detail?.first_occurrence,
    reportingComponent: detail?.reportingComponent ?? detail?.reporting_component,
  }
}
