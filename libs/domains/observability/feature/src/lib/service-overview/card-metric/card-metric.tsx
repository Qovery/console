import clsx from 'clsx'
import { type ComponentProps, type ReactNode } from 'react'
import { Skeleton } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'

interface CardMetricProps extends Omit<ComponentProps<'button'>, 'value'> {
  title: string
  value: number | ReactNode
  unit?: string
  status: 'GREEN' | 'YELLOW' | 'RED'
  description?: string
  isLoading?: boolean
  isClickable?: boolean
}

export function CardMetric({
  title,
  value,
  unit,
  status,
  description,
  isLoading = true,
  className,
  isClickable = false,
  ...props
}: CardMetricProps) {
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
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
    }

    return <div className={`relative top-[1px] h-2 w-2 rounded-full ${dotClasses[color as keyof typeof dotClasses]}`} />
  }

  return (
    <button
      type="button"
      className={twMerge(
        clsx(
          'w-full cursor-default rounded border border-neutral-200 bg-neutral-50 px-5 py-4',
          !isLoading && isClickable && 'cursor-pointer shadow-[0px_1px_2px_0px_rgba(27,36,44,0.12)] hover:shadow-md',
          className
        )
      )}
      disabled={isLoading}
      {...props}
    >
      <div className="flex flex-col justify-between gap-1 text-left">
        <div className="flex items-center gap-2.5">
          <p className="text-sm text-neutral-400">{title}</p>
          <Skeleton show={isLoading} width={8} height={8} rounded>
            {getStatusDot()}
          </Skeleton>
        </div>
        <Skeleton show={isLoading} width={32} height={32} rounded>
          <span className="text-xl font-bold text-neutral-400">{value}</span>
        </Skeleton>
        {description && (
          <Skeleton show={isLoading} width={130} height={16}>
            <p className="text-sm text-neutral-350">{description}</p>
          </Skeleton>
        )}
      </div>
    </button>
  )
}

export default CardMetric
