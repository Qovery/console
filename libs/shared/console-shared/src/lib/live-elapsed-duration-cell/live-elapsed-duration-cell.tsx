import { useEffect, useState } from 'react'
import { Icon } from '@qovery/shared/ui'
import { dateDifference } from '@qovery/shared/util-dates'

export function LiveElapsedDuration({ createdAt }: { createdAt: string }) {
  const [, setTick] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setTick((n) => n + 1)
    }, 1000)
    return () => window.clearInterval(id)
  }, [])

  const start = new Date(createdAt)
  const label = Number.isNaN(start.getTime()) ? '--' : dateDifference(new Date(), start)

  return (
    <span className="flex items-center gap-1 text-neutral-subtle">
      <Icon iconName="clock-eight" iconStyle="regular" />
      {label}
    </span>
  )
}
