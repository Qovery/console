import { forwardRef } from 'react'
import { ProgressBar } from '@qovery/shared/ui'
import { calculatePercentage } from '@qovery/shared/util-js'

export interface ClusterProgressBarNodeProps {
  used: number
  reserved: number
  total: number
}

export const ClusterProgressBarNode = forwardRef<HTMLDivElement, ClusterProgressBarNodeProps>(
  ({ used, reserved, total }, ref) => {
    const usedPercentage = calculatePercentage(used, total)
    const reservedPercentage = calculatePercentage(reserved, total)

    const isLimitReached = usedPercentage > 80

    return (
      <div ref={ref} className="relative w-full">
        <ProgressBar.Root mode="absolute">
          <ProgressBar.Cell value={reservedPercentage} color="var(--color-purple-200)" />
          <ProgressBar.Cell
            className="left-0.5 top-1/2 h-1 -translate-y-1/2 rounded-l-full"
            value={usedPercentage}
            color="var(--color-brand-400)"
          />
          {usedPercentage > reservedPercentage && (
            <ProgressBar.Cell
              className="left-0.5 top-1/2 h-1 -translate-y-1/2"
              value={usedPercentage - reservedPercentage + 1} // 1 is hack to compensate border-r and left-0.5
              color={isLimitReached ? 'var(--color-yellow-500)' : 'var(--color-brand-400)'}
              style={{
                left: `${reservedPercentage}%`,
              }}
            />
          )}
        </ProgressBar.Root>
        {reservedPercentage < 99 && (
          <span
            className="absolute top-0 h-full w-[1px] bg-purple-500"
            style={{
              left: `${reservedPercentage}%`,
            }}
          />
        )}
      </div>
    )
  }
)

ClusterProgressBarNode.displayName = 'ClusterProgressBarNode'

export default ClusterProgressBarNode
