import clsx from 'clsx'
import type { AnyService } from '@qovery/domains/services/data-access'
import { Badge, Icon, Skeleton, Tooltip } from '@qovery/shared/ui'
import { getColorByPod } from '@qovery/shared/util-hooks'
import { pluralize } from '@qovery/shared/util-js'
import { formatTimestamp } from '../util-chart/format-timestamp'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'
import type { ReferenceLineEvent } from './local-chart'

export interface ChartEventSidebarProps {
  events: ReferenceLineEvent[]
  service?: AnyService
  isLoading?: boolean
  label?: string
}

export function ChartEventSidebar({ events, service, isLoading = false, label = '' }: ChartEventSidebarProps) {
  const { useLocalTime, hoveredEventKey, setHoveredEventKey } = useServiceOverviewContext()

  return (
    <div className="flex h-[87vh] w-full min-w-[420px] max-w-[420px] flex-col border-l border-neutral-250">
      <p className="border-b border-neutral-250 bg-neutral-100 px-4 py-2 text-xs font-medium text-neutral-500">
        {pluralize(events.length, 'Event', 'Events')} associated
      </p>
      <div className="h-full overflow-y-auto">
        {isLoading ? (
          <>
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="flex gap-2 border-b border-neutral-250 px-4 py-2 text-sm text-neutral-500">
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
              const key = `${label}-${event.key}`
              return (
                <div
                  key={key}
                  className={clsx('flex gap-2 border-b border-neutral-250 px-4 py-2 text-sm text-neutral-500', {
                    'bg-neutral-150': hoveredEventKey === key,
                  })}
                  onMouseEnter={() => setHoveredEventKey(key)}
                  onMouseLeave={() => setHoveredEventKey(null)}
                >
                  <span
                    className="flex h-5 min-h-5 w-5 min-w-5 items-center justify-center rounded-full"
                    style={{ backgroundColor: event.color ?? 'var(--color-red-500)' }}
                  >
                    <Icon
                      iconName={event.icon}
                      iconStyle={event.iconStyle ?? 'regular'}
                      className="text-xs text-white"
                    />
                  </span>
                  <div className="flex w-full flex-col gap-1 text-xs">
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="font-medium">{event.reason}</span>
                      <span className="text-neutral-350">{timestamp.fullTimeString}</span>
                    </div>
                    {event.type === 'event' && (
                      <>
                        <span className="text-neutral-350">
                          {service?.serviceType === 'CONTAINER' ? 'Image name' : 'Repository'}: {event.repository}
                        </span>
                        <span className="text-neutral-350">
                          {service?.serviceType === 'CONTAINER' ? 'Tag' : 'Version'}: {event.version?.slice(0, 8)}
                        </span>
                      </>
                    )}
                    {event.description && <span className="text-neutral-350">{event.description}</span>}
                    {event.type === 'exit-code' && (
                      <div className="flex items-center gap-1">
                        <span className="text-neutral-350">Instance name:</span>
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
                  </div>
                </div>
              )
            })}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm">
            <p className="text-neutral-350">No events associated</p>
          </div>
        )}
      </div>
    </div>
  )
}
