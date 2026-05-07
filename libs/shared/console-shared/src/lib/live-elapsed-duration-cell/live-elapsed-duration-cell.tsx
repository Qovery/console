import { Icon } from '@qovery/shared/ui'
import { dateDifference } from '@qovery/shared/util-dates'
import { useIntervalTick } from '@qovery/shared/util-hooks'

export function LiveElapsedDuration({ createdAt }: { createdAt: string }) {
  useIntervalTick()

  const start = new Date(createdAt)
  const label = Number.isNaN(start.getTime()) ? '--' : dateDifference(new Date(), start)

  return (
    <span className="flex items-center gap-1 text-neutral-subtle">
      <Icon iconName="clock-eight" iconStyle="regular" />
      {label}
    </span>
  )
}
