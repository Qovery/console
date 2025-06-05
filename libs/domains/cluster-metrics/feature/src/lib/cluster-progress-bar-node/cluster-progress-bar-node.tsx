import { ProgressBar } from '@qovery/shared/ui'
import { calculatePercentage } from '@qovery/shared/util-js'

export interface ClusterProgressBarNodeProps {
  used: number
  reserved: number
  total: number
}

export function ClusterProgressBarNode({ used, reserved, total }: ClusterProgressBarNodeProps) {
  const usedPercentage = calculatePercentage(used, total)
  const reservedPercentage = calculatePercentage(reserved, total)

  return (
    <div className="relative w-full">
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
            value={usedPercentage - reservedPercentage + 0.8} // 0.8 is hack to compensate border-r and left-0.5
            color="var(--color-yellow-500)"
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

export default ClusterProgressBarNode
