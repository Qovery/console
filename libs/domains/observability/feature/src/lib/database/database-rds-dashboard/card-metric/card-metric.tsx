import { type ComponentProps, type ReactNode } from 'react'
import { Badge, Heading, Icon, Section, Skeleton, Tooltip } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'

interface CardMetricProps extends Omit<ComponentProps<'div'>, 'value' | 'onClick'> {
  title: string
  value?: string | number
  valueDescription?: string
  unit?: string
  status?: 'GREEN' | 'YELLOW' | 'RED'
  statusDescription?: ReactNode
  description?: ReactNode
  isLoading?: boolean
}

export function CardMetric({
  title,
  value,
  valueDescription,
  unit,
  status,
  statusDescription = '',
  description,
  isLoading = false,
  className,
  ...props
}: CardMetricProps) {
  return (
    <Section
      className={twMerge(
        'h-full w-full justify-center rounded-lg border border-neutral bg-surface-neutral p-4',
        className
      )}
      {...props}
    >
      <div className="flex flex-col justify-between gap-0.5">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex w-full items-center justify-between gap-3.5">
            <Skeleton
              className="flex w-full items-center justify-between gap-1.5"
              show={isLoading}
              width={170}
              height={16}
            >
              <Heading className="flex items-center gap-1 font-normal text-neutral-subtle">
                {title}
                <Tooltip content={description}>
                  <span>
                    <Icon iconName="info-circle" iconStyle="regular" className="text-xs text-neutral-subtle" />
                  </span>
                </Tooltip>
              </Heading>
              {status && (
                <Tooltip content={statusDescription}>
                  <Badge
                    className="ml-1.5 gap-1 font-medium"
                    color={status === 'RED' ? 'red' : status === 'YELLOW' ? 'yellow' : 'green'}
                    size="base"
                  >
                    <Icon
                      iconName={
                        status === 'GREEN'
                          ? 'circle-check'
                          : status === 'YELLOW'
                            ? 'triangle-exclamation'
                            : 'circle-exclamation'
                      }
                      iconStyle="regular"
                    />
                    {status === 'GREEN' ? 'Healthy' : status === 'YELLOW' ? 'Warning' : 'Critical'}
                  </Badge>
                </Tooltip>
              )}
            </Skeleton>
          </div>
        </div>

        <Skeleton show={isLoading} width={100} height={32}>
          <div className="flex flex-col">
            {value !== undefined && (
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold text-neutral-subtle">
                  {value} {unit}
                </span>
              </div>
            )}
            {valueDescription && <p className="text-sm text-neutral-subtle">{valueDescription}</p>}
          </div>
        </Skeleton>
      </div>
    </Section>
  )
}

export default CardMetric
