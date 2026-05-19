import { useQuery } from '@tanstack/react-query'
import type { GetClusterKubernetesEvents200ResponseResultsInner } from 'qovery-typescript-axios'
import { useState } from 'react'
import { observability } from '@qovery/domains/observability/data-access'
import type { AnyService } from '@qovery/domains/services/data-access'
import { Badge, DescriptionList, Icon, Skeleton, Tooltip } from '@qovery/shared/ui'
import { getColorByPod } from '@qovery/shared/util-hooks'
import { pluralize, twMerge } from '@qovery/shared/util-js'
import { formatTimestamp } from '../util-chart/format-timestamp'
import { useDashboardContext } from '../util-filter/dashboard-context'
import type { ReferenceLineEvent } from './local-chart'

export interface EventSidebarProps {
  events: ReferenceLineEvent[]
  clusterId?: string
  serviceId: string
  service?: AnyService
  isLoading?: boolean
}

interface KubernetesEventApiResponse extends GetClusterKubernetesEvents200ResponseResultsInner {
  createdAt?: string
  firstOccurrence?: string
  lastOccurrence?: string
  reportingComponent?: string
}

interface KubernetesEventDetail extends KubernetesEventApiResponse {
  distance: number
  timestamp: number
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

function KubernetesEventDetails({
  clusterId,
  serviceId,
  event,
}: {
  clusterId?: string
  serviceId: string
  event: ReferenceLineEvent
}) {
  const WINDOW_MS = 2 * 60 * 60 * 1000
  const { useLocalTime } = useDashboardContext()
  const fromDateTime = new Date(event.timestamp - WINDOW_MS).toISOString()
  const toDateTime = new Date(event.timestamp + WINDOW_MS).toISOString()
  const podName = getShortServiceId(serviceId)

  const { data, isLoading } = useQuery({
    ...observability.kubernetesEvents({
      clusterId: clusterId ?? '',
      fromDateTime,
      toDateTime,
      podName,
    }),
    enabled: Boolean(clusterId && serviceId && event.type === 'k8s-event'),
    staleTime: 60_000,
  })

  const detail = findNearestKubernetesEvent(data as KubernetesEventApiResponse[] | undefined, event, serviceId)
  const firstOccurrence = detail?.firstOccurrence ?? detail?.first_occurrence
  const reportingComponent = detail?.reportingComponent ?? detail?.reporting_component

  if (!clusterId) {
    return (
      <div className="mt-2 border-l border-neutral pl-3">
        <span className="text-neutral-subtle">Kubernetes event details are not available.</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="mt-2 flex flex-col gap-1 border-l border-neutral pl-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="mt-2 border-l border-neutral pl-3">
        <span className="text-neutral-subtle">No matching Kubernetes event found.</span>
      </div>
    )
  }

  return (
    <div className="mt-2 flex flex-col gap-2 border-l border-neutral pl-3">
      {detail.message && <p className="font-medium leading-5 text-neutral">{detail.message}</p>}
      <DescriptionList.Root className="grid-cols-[max-content_minmax(0,_1fr)] gap-x-3 gap-y-1 text-xs">
        {firstOccurrence && (
          <>
            <DescriptionList.Term className="whitespace-nowrap">Kubernetes time</DescriptionList.Term>
            <DescriptionList.Details className="min-w-0 break-words">
              {formatTimestamp(new Date(firstOccurrence).getTime(), useLocalTime).fullTimeString}
            </DescriptionList.Details>
          </>
        )}
        <DescriptionList.Term className="whitespace-nowrap">Monitoring marker</DescriptionList.Term>
        <DescriptionList.Details className="min-w-0 break-words">
          {formatTimestamp(event.timestamp, useLocalTime).fullTimeString}
        </DescriptionList.Details>
        <DescriptionList.Term className="whitespace-nowrap">Matched event time</DescriptionList.Term>
        <DescriptionList.Details className="min-w-0 break-words">
          {formatTimestamp(detail.timestamp, useLocalTime).fullTimeString}
        </DescriptionList.Details>
        {detail.name && (
          <>
            <DescriptionList.Term className="whitespace-nowrap">Pod</DescriptionList.Term>
            <DescriptionList.Details className="min-w-0 break-words font-code">{detail.name}</DescriptionList.Details>
          </>
        )}
        {detail.namespace && (
          <>
            <DescriptionList.Term className="whitespace-nowrap">Namespace</DescriptionList.Term>
            <DescriptionList.Details className="min-w-0 break-words font-code">
              {detail.namespace}
            </DescriptionList.Details>
          </>
        )}
        {reportingComponent && (
          <>
            <DescriptionList.Term className="whitespace-nowrap">Component</DescriptionList.Term>
            <DescriptionList.Details className="min-w-0 break-words">{reportingComponent}</DescriptionList.Details>
          </>
        )}
        {detail.count !== undefined && (
          <>
            <DescriptionList.Term className="whitespace-nowrap">Count</DescriptionList.Term>
            <DescriptionList.Details>{detail.count}</DescriptionList.Details>
          </>
        )}
      </DescriptionList.Root>
    </div>
  )
}

export function EventSidebar({ events, clusterId, serviceId, service, isLoading = false }: EventSidebarProps) {
  const { useLocalTime } = useDashboardContext()
  const [expandedEventKey, setExpandedEventKey] = useState<string>()

  return (
    <div className="flex h-[87vh] w-full min-w-[420px] max-w-[420px] flex-col border-l border-neutral">
      <p className="border-b border-neutral bg-surface-neutral-subtle px-4 py-2 text-xs font-medium text-neutral-subtle">
        {pluralize(events.length, 'Event', 'Events')} associated
      </p>
      <div className="h-full overflow-y-auto">
        {isLoading ? (
          <>
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="flex gap-2 border-b border-neutral px-4 py-2 text-sm text-neutral-subtle">
                <Skeleton className="h-5 min-h-5 w-5 min-w-5" rounded />
                <div className="flex w-full flex-col gap-1 text-xs">
                  <div className="flex w-full items-center justify-between gap-2">
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </>
        ) : events.length > 0 ? (
          <>
            {events.map((event) => {
              const timestamp = formatTimestamp(event.timestamp, useLocalTime)
              const key = event.key
              const isExpandable = event.type === 'k8s-event'
              const isExpanded = expandedEventKey === key
              return (
                <div
                  key={key}
                  className={twMerge(
                    'flex gap-2 border-b border-neutral px-4 py-2 text-sm text-neutral-subtle hover:bg-surface-neutral-componentHover',
                    isExpandable && 'cursor-pointer',
                    isExpanded && 'bg-surface-neutral-subtle'
                  )}
                  data-event-key={key}
                  onClick={() => {
                    if (!isExpandable) return
                    setExpandedEventKey((current) => (current === key ? undefined : key))
                  }}
                  onMouseEnter={() => {
                    const referenceLine = document.querySelectorAll(`.recharts-reference-line-line[name="${key}"]`)
                    referenceLine.forEach((line) => {
                      line.classList.add('active')
                    })
                  }}
                  onMouseLeave={() => {
                    const referenceLine = document.querySelectorAll(`.recharts-reference-line-line[name="${key}"]`)
                    referenceLine.forEach((line) => {
                      line.classList.remove('active')
                    })
                  }}
                >
                  <span
                    className="flex h-5 min-h-5 w-5 min-w-5 items-center justify-center rounded-full"
                    style={{ backgroundColor: event.color ?? 'var(--negative-11)' }}
                  >
                    <Icon
                      iconName={event.icon}
                      iconStyle={event.iconStyle ?? 'regular'}
                      className="text-xs text-neutralInvert"
                    />
                  </span>
                  <div className="flex w-full flex-col gap-1 text-xs">
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="font-medium">{event.reason}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-neutral-subtle">{timestamp.fullTimeString}</span>
                        {isExpandable && (
                          <button
                            type="button"
                            className="focus:ring-brand-500 flex h-5 w-5 items-center justify-center rounded text-neutral-subtle hover:bg-surface-neutral-subtle hover:text-neutral focus:outline-none focus:ring-2"
                            onClick={(event) => {
                              event.stopPropagation()
                              setExpandedEventKey((current) => (current === key ? undefined : key))
                            }}
                            aria-expanded={isExpanded}
                            aria-label={isExpanded ? 'Hide Kubernetes event details' : 'Show Kubernetes event details'}
                          >
                            <Icon
                              iconName={isExpanded ? 'chevron-down' : 'chevron-right'}
                              iconStyle="regular"
                              className="text-xs"
                            />
                          </button>
                        )}
                      </div>
                    </div>
                    {event.type === 'event' && (
                      <>
                        <span className="text-neutral-subtle">
                          {service?.serviceType === 'CONTAINER' ? 'Image name' : 'Repository'}: {event.repository}
                        </span>
                        <span className="text-neutral-subtle">
                          {service?.serviceType === 'CONTAINER' ? 'Tag' : 'Version'}: {event.version?.slice(0, 8)}
                        </span>
                      </>
                    )}
                    {event.description && <span className="text-neutral-subtle">{event.description}</span>}
                    {event.type === 'exit-code' && (
                      <div className="flex items-center gap-1">
                        <span className="text-neutral-subtle">Instance name:</span>
                        <Tooltip content={event.pod ?? ''}>
                          <Badge
                            variant="surface"
                            color="neutral"
                            size="sm"
                            className="max-w-max gap-1 font-code text-2xs"
                          >
                            <span
                              className="block h-1.5 w-1.5 min-w-1.5 rounded-sm"
                              style={{ backgroundColor: getColorByPod(event.pod ?? '') }}
                            />
                            {event.pod?.substring(event.pod?.length - 5)}
                          </Badge>
                        </Tooltip>
                      </div>
                    )}
                    {isExpanded && <KubernetesEventDetails clusterId={clusterId} serviceId={serviceId} event={event} />}
                  </div>
                </div>
              )
            })}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm">
            <p className="text-neutral-subtle">No events associated</p>
          </div>
        )}
      </div>
    </div>
  )
}
