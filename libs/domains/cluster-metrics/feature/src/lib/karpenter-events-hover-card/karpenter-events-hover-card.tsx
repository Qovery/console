import * as HoverCard from '@radix-ui/react-hover-card'
import clsx from 'clsx'
import { type GetClusterKubernetesEvents200ResponseResultsInner } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { IconEnum } from '@qovery/shared/enums'
import { Icon } from '@qovery/shared/ui'
import { dateUTCString, timeAgo } from '@qovery/shared/util-dates'
import { pluralize } from '@qovery/shared/util-js'

export interface KarpenterEventsHoverCardProps extends PropsWithChildren {
  children: React.ReactNode
  events?: GetClusterKubernetesEvents200ResponseResultsInner[]
}

export function KarpenterEventsHoverCard({
  children,
  events,
}: {
  children: React.ReactNode
  events?: GetClusterKubernetesEvents200ResponseResultsInner[]
}) {
  if (!events || events.length === 0) return children

  return (
    <HoverCard.Root>
      <HoverCard.Trigger asChild>{children}</HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          onClick={(e) => e.stopPropagation()}
          className="relative left-10 w-[350px] rounded-md bg-white p-3 shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] data-[state=open]:data-[side=bottom]:animate-slidein-up-md-faded data-[state=open]:data-[side=left]:animate-slidein-right-sm-faded data-[state=open]:data-[side=right]:animate-slidein-left-md-faded data-[state=open]:data-[side=top]:animate-slidein-down-md-faded data-[state=open]:transition-all"
          sideOffset={10}
        >
          <div className="flex flex-col gap-2 text-ssm">
            <p className="font-medium">Last Karpenter {pluralize(events.length, 'event', 'events')} attached</p>
            {events
              .sort((a, b) => new Date(b.last_occurrence || '').getTime() - new Date(a.last_occurrence || '').getTime())
              .map((event) => (
                <div
                  key={event.created_at}
                  className="flex items-center justify-between gap-2 rounded border border-neutral-250 bg-neutral-100 px-3 py-2"
                >
                  <div className="flex gap-3">
                    <Icon name={IconEnum.KARPENTER} />
                    <div className="flex flex-col gap-0.5 text-xs text-neutral-400">
                      <span
                        className={clsx('font-medium', {
                          'text-yellow-700': event.type === 'Warning',
                        })}
                      >
                        {event.reason}
                      </span>
                      <span className={event.type === 'Warning' ? 'text-yellow-700' : ''}>{event.message}</span>
                    </div>
                  </div>
                  <span
                    title={event.last_occurrence && dateUTCString(event.last_occurrence)}
                    className="text-xs text-neutral-350"
                  >
                    {timeAgo(new Date(event.last_occurrence || ''), true)}
                  </span>
                </div>
              ))}
          </div>
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  )
}
