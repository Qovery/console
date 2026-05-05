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
      <div className="flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex w-full items-center justify-between gap-3.5">
            {isLoading ? (
              <Skeleton width="100%" height={20} className="rounded-md" />
            ) : (
              <>
                <Heading weight="medium" level={3} className="flex items-center gap-1">
                  {title}
                  <Tooltip content={description}>
                    <span>
                      <Icon iconName="circle-info" iconStyle="regular" className="text-xs text-neutral-subtle" />
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
              </>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3 pt-3">
            <Skeleton width={120} height={24} className="rounded-md" />
            <Skeleton width="75%" height={16} className="rounded-md" />
          </div>
        ) : (
          <div className="mt-2 flex flex-col">
            {value !== undefined && (
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold text-neutral">
                  {value} {unit}
                </span>
              </div>
            )}
            {valueDescription && <p className="text-ssm text-neutral-subtle">{valueDescription}</p>}
          </div>
        )}
      </div>
    </Section>
  )
}

export default CardMetric
