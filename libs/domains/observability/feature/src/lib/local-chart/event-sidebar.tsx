import { Suspense, useState } from 'react'
import type { AnyService } from '@qovery/domains/services/data-access'
import { Badge, Button, DescriptionList, Icon, Skeleton, Tooltip } from '@qovery/shared/ui'
import { getColorByPod } from '@qovery/shared/util-hooks'
import { pluralize, twMerge } from '@qovery/shared/util-js'
import { useKubernetesEventDetails } from '../hooks/use-kubernetes-event-details/use-kubernetes-event-details'
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

function KubernetesEventDetailsUnavailable() {
  return (
    <div className="mt-2 border-l border-neutral pl-3">
      <span className="text-neutral-subtle">Kubernetes event details are not available.</span>
    </div>
  )
}

function KubernetesEventDetailsButton({
  isExpanded,
  isLoading = false,
  onClick,
}: {
  isExpanded: boolean
  isLoading?: boolean
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      variant="outline"
      color="neutral"
      size="xs"
      className={twMerge('mt-1 w-fit shrink-0 gap-1.5', isLoading && 'pointer-events-auto')}
      onClick={(event) => {
        event.stopPropagation()
        if (isLoading) return
        onClick()
      }}
      aria-expanded={isExpanded}
      aria-label={isExpanded ? 'Hide Kubernetes event details' : 'Show Kubernetes event details'}
      loading={isLoading}
    >
      {isExpanded ? 'Hide details' : 'See details'}
    </Button>
  )
}

function KubernetesEventDetails({
  clusterId,
  serviceId,
  event,
}: {
  clusterId: string
  serviceId: string
  event: ReferenceLineEvent
}) {
  const { useLocalTime } = useDashboardContext()
  const { detail, firstOccurrence, reportingComponent } = useKubernetesEventDetails({ clusterId, serviceId, event })

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
            <DescriptionList.Details className="min-w-0 break-words font-code font-normal text-neutral">
              {formatTimestamp(new Date(firstOccurrence).getTime(), useLocalTime).fullTimeString}
            </DescriptionList.Details>
          </>
        )}
        <DescriptionList.Term className="whitespace-nowrap">Monitoring marker</DescriptionList.Term>
        <DescriptionList.Details className="min-w-0 break-words font-code font-normal text-neutral">
          {formatTimestamp(event.timestamp, useLocalTime).fullTimeString}
        </DescriptionList.Details>
        <DescriptionList.Term className="whitespace-nowrap">Matched event time</DescriptionList.Term>
        <DescriptionList.Details className="min-w-0 break-words font-code font-normal text-neutral">
          {formatTimestamp(detail.timestamp, useLocalTime).fullTimeString}
        </DescriptionList.Details>
        {detail.name && (
          <>
            <DescriptionList.Term className="whitespace-nowrap">Pod</DescriptionList.Term>
            <DescriptionList.Details className="min-w-0 break-words font-code font-normal text-neutral">
              {detail.name}
            </DescriptionList.Details>
          </>
        )}
        {detail.namespace && (
          <>
            <DescriptionList.Term className="whitespace-nowrap">Namespace</DescriptionList.Term>
            <DescriptionList.Details className="min-w-0 break-words font-code font-normal text-neutral">
              {detail.namespace}
            </DescriptionList.Details>
          </>
        )}
        {reportingComponent && (
          <>
            <DescriptionList.Term className="whitespace-nowrap">Component</DescriptionList.Term>
            <DescriptionList.Details className="min-w-0 break-words font-code font-normal text-neutral">
              {reportingComponent}
            </DescriptionList.Details>
          </>
        )}
        {detail.count !== undefined && (
          <>
            <DescriptionList.Term className="whitespace-nowrap">Count</DescriptionList.Term>
            <DescriptionList.Details className="font-code font-normal text-neutral">
              {detail.count}
            </DescriptionList.Details>
          </>
        )}
      </DescriptionList.Root>
    </div>
  )
}

function KubernetesEventDetailsExpanded({
  clusterId,
  serviceId,
  event,
  onToggle,
}: {
  clusterId: string
  serviceId: string
  event: ReferenceLineEvent
  onToggle: () => void
}) {
  return (
    <>
      <KubernetesEventDetailsButton isExpanded onClick={onToggle} />
      <KubernetesEventDetails clusterId={clusterId} serviceId={serviceId} event={event} />
    </>
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
              const toggleEventDetails = () => {
                setExpandedEventKey((current) => (current === key ? undefined : key))
              }

              return (
                <div
                  key={key}
                  className="flex gap-2 border-b border-neutral px-4 py-2 text-sm text-neutral-subtle hover:bg-surface-neutral-componentHover"
                  data-event-key={key}
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
                      <span className="text-neutral-subtle">{timestamp.fullTimeString}</span>
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
                    {isExpandable && (
                      <>
                        {isExpanded && clusterId ? (
                          <Suspense
                            fallback={
                              <KubernetesEventDetailsButton isExpanded isLoading onClick={toggleEventDetails} />
                            }
                          >
                            <KubernetesEventDetailsExpanded
                              clusterId={clusterId}
                              serviceId={serviceId}
                              event={event}
                              onToggle={toggleEventDetails}
                            />
                          </Suspense>
                        ) : (
                          <KubernetesEventDetailsButton isExpanded={isExpanded} onClick={toggleEventDetails} />
                        )}
                        {isExpanded && !clusterId && <KubernetesEventDetailsUnavailable />}
                      </>
                    )}
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
