import clsx from 'clsx'
import { type ComponentProps } from 'react'
import { Skeleton } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

interface CardMetricProps extends ComponentProps<'button'> {
  title: string
  value: string | number
  unit?: string
  status: 'GREEN' | 'YELLOW' | 'RED'
  description?: string
  isLoading?: boolean
  scrollToId?: string
}

export function CardMetric({
  title,
  value,
  unit,
  status,
  description,
  isLoading = true,
  className,
  scrollToId,
  onClick,
  ...props
}: CardMetricProps) {
  const { setExpandCharts, handleTimeRangeChange } = useServiceOverviewContext()

  const getStatusColor = () => {
    switch (status) {
      case 'GREEN':
        return 'green'
      case 'YELLOW':
        return 'yellow'
      case 'RED':
        return 'red'
      default:
        return 'neutral'
    }
  }

  const getStatusDot = () => {
    const color = getStatusColor()
    const dotClasses = {
      green: 'bg-green-500 border-green-200',
      yellow: 'bg-yellow-500 border-yellow-200',
      red: 'bg-red-500 border-red-200',
      neutral: 'bg-neutral-500 border-neutral-200',
    }

    return (
      <div className={`box-content h-2 w-2 rounded-full border-2 ${dotClasses[color as keyof typeof dotClasses]}`} />
    )
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) onClick(e)

    if (scrollToId) {
      handleTimeRangeChange('24h')
      setExpandCharts(true)
      setTimeout(() => {
        const element = document.getElementById(scrollToId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 50)
    }
  }

  return (
    <button
      type="button"
      className={twMerge(
        clsx(
          'w-full cursor-default rounded border border-neutral-200 bg-neutral-50 p-4 text-left',
          !isLoading && scrollToId && 'cursor-pointer transition-colors hover:bg-neutral-100',
          className
        )
      )}
      onClick={handleClick}
      disabled={isLoading}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="text-sm font-medium text-neutral-400">{title}</h3>
            <Skeleton show={isLoading} width={12} height={12} rounded>
              {getStatusDot()}
            </Skeleton>
          </div>
          <div className="flex items-baseline gap-1">
            <Skeleton show={isLoading} width={32} height={32} rounded>
              <span className="text-2xl font-bold text-neutral-400">{value}</span>
            </Skeleton>
            {unit && !isLoading && <span className="text-sm text-neutral-400">{unit}</span>}
          </div>
          {description && (
            <Skeleton className="mt-1" show={isLoading} width={130} height={16}>
              <p className="text-xs text-neutral-400">{description}</p>
            </Skeleton>
          )}
        </div>
      </div>
    </button>
  )
}

export default CardMetric
