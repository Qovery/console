import { type IconName } from '@fortawesome/fontawesome-common-types'
import clsx from 'clsx'
import { type ComponentProps, type ReactNode } from 'react'
import { Button, Icon, Skeleton, Tooltip } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'

interface CardMetricProps extends Omit<ComponentProps<'button'>, 'value'> {
  title: string
  value: number | ReactNode
  unit?: string
  status: 'GREEN' | 'YELLOW' | 'RED'
  description?: string
  isLoading?: boolean
  hasModalLink?: boolean
  icon?: IconName
}

export function CardMetric({
  title,
  value,
  unit,
  status,
  description,
  isLoading = true,
  className,
  hasModalLink = false,
  icon = 'chart-line',
  onClick,
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
          'w-full cursor-default rounded border border-neutral-250 bg-neutral-50 px-5 py-4',
          !isLoading && 'cursor-pointer shadow-[0px_1px_2px_0px_rgba(27,36,44,0.12)] hover:shadow-md',
          className
        )
      )}
      disabled={isLoading}
      onClick={onClick}
      {...props}
    >
      <div className="flex flex-col justify-between gap-1 text-left">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <p className="text-sm text-neutral-400">{title}</p>
            <Skeleton show={isLoading} width={8} height={8} rounded>
              {getStatusDot()}
            </Skeleton>
          </div>
          {(hasModalLink || onClick) && (
            <Tooltip content={!hasModalLink ? 'Show logs' : 'Show chart'}>
              <Button
                variant="plain"
                color="neutral"
                size="sm"
                className="relative left-2 w-7 items-center justify-center p-0"
              >
                <Icon iconName={icon} />
              </Button>
            </Tooltip>
          )}
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
