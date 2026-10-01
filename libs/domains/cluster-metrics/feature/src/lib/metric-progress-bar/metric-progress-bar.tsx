import clsx from 'clsx'
import { Icon, ProgressBar, Tooltip } from '@qovery/shared/ui'
import { calculatePercentage } from '@qovery/shared/util-js'

export interface MetricProgressBarProps {
  type: 'cpu' | 'memory'
  reserved: number
  reservedRaw: number
  total: number
  totalRaw: number
  unit: string
  isPressure?: boolean
}

export interface ReservedTooltipContentProps {
  type: 'cpu' | 'memory'
  reserved: number | string
  total: number | string
  unit: string
}

export function ReservedTooltipContent({ type, reserved, total, unit }: ReservedTooltipContentProps) {
  return (
    <div className="flex flex-col gap-1 text-left font-normal">
      <div className="flex items-center justify-between border-b border-neutralInvert">
        <span className="px-2.5 py-1.5">{type === 'cpu' ? 'CPU' : 'Memory'}</span>
      </div>
      <div className="flex flex-col gap-1 px-2.5 py-1.5">
        <div className="flex w-full items-center gap-1.5">
          <span>Reserved</span>
          <span className="ml-auto block">
            {reserved} {unit}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-neutralInvert px-2.5 py-1.5">
        <span>Total Available</span>
        <span className="ml-auto block">
          {total} {unit}
        </span>
      </div>
    </div>
  )
}

export function MetricProgressBar({
  type,
  reserved,
  reservedRaw,
  total,
  totalRaw,
  unit,
  isPressure = false,
}: MetricProgressBarProps) {
  const reservedPercentage = calculatePercentage(reservedRaw, totalRaw)
  const totalPercentage = Math.round(reservedPercentage)
  // Keep small positive reservations visible without changing the displayed percentage
  const barPercentage = reservedRaw > 0 ? Math.max(reservedPercentage, 0.5) : 0

  return (
    <div className="flex w-full items-center gap-1 text-ssm">
      <span
        className={clsx('flex min-w-8 items-center gap-1 whitespace-nowrap', {
          'text-negative': isPressure,
          'text-neutral-subtle': !isPressure,
        })}
      >
        {totalPercentage}%
        {isPressure && (
          <Tooltip content={`Node has ${type} pressure condition`}>
            <span className="mr-1.5">
              <Icon iconName="circle-exclamation" iconStyle="regular" />
            </span>
          </Tooltip>
        )}
      </span>
      <Tooltip
        content={<ReservedTooltipContent type={type} reserved={reserved} total={total} unit={unit} />}
        classNameContent="w-[173px] p-0"
      >
        <div
          className="focus-visible:outline-brand-11 relative w-full rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          tabIndex={0}
          role="img"
          aria-label={`${type === 'cpu' ? 'CPU' : 'Memory'} reserved: ${reserved} of ${total} ${unit}`}
        >
          <ProgressBar.Root>
            <ProgressBar.Cell value={barPercentage} color="var(--brand-9)" />
          </ProgressBar.Root>
        </div>
      </Tooltip>
    </div>
  )
}

export default MetricProgressBar
