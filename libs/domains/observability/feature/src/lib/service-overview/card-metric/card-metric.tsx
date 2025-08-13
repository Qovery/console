import { type IconName } from '@fortawesome/fontawesome-common-types'
import clsx from 'clsx'
import { type ComponentProps } from 'react'
import { Badge, Button, Heading, Icon, Section, Skeleton, Tooltip } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'

export function CardMetricButton({
  hasModalLink = false,
  icon,
  onClick,
}: {
  hasModalLink?: boolean
  icon?: IconName
  onClick?: ComponentProps<'button'>['onClick']
}) {
  return (
    <Tooltip content={!hasModalLink ? `Show logs${onClick ? '' : ' disabled'}` : 'Show chart'}>
      <Button
        variant="outline"
        color="neutral"
        size="xs"
        className="w-6 items-center justify-center p-0"
        disabled={!onClick}
        onClick={onClick}
      >
        {icon ? (
          <Icon iconName={icon} iconStyle="regular" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
            <g fill="#383E50" fillRule="evenodd" clipPath="url(#clip0_25356_47547)" clipRule="evenodd">
              <path d="M4.15 3.6a.55.55 0 0 0-.55.55v1.1a.55.55 0 1 1-1.1 0v-1.1A1.65 1.65 0 0 1 4.15 2.5h1.1a.55.55 0 1 1 0 1.1zM10.2 3.05a.55.55 0 0 1 .55-.55h1.1a1.65 1.65 0 0 1 1.65 1.65v1.1a.55.55 0 1 1-1.1 0v-1.1a.55.55 0 0 0-.55-.55h-1.1a.55.55 0 0 1-.55-.55M12.95 10.2a.55.55 0 0 1 .55.55v1.1a1.65 1.65 0 0 1-1.65 1.65h-1.1a.55.55 0 1 1 0-1.1h1.1a.55.55 0 0 0 .55-.55v-1.1a.55.55 0 0 1 .55-.55M3.05 10.2a.55.55 0 0 1 .55.55v1.1a.55.55 0 0 0 .55.55h1.1a.55.55 0 1 1 0 1.1h-1.1a1.65 1.65 0 0 1-1.65-1.65v-1.1a.55.55 0 0 1 .55-.55M4.7 6.35a1.1 1.1 0 0 1 1.1-1.1h4.4a1.1 1.1 0 0 1 1.1 1.1v3.3a1.1 1.1 0 0 1-1.1 1.1H5.8a1.1 1.1 0 0 1-1.1-1.1zm5.5 0H5.8v3.3h4.4z"></path>
            </g>
            <defs>
              <clipPath id="clip0_25356_47547">
                <path fill="#fff" d="M2 2h12v12H2z"></path>
              </clipPath>
            </defs>
          </svg>
        )}
      </Button>
    </Tooltip>
  )
}

interface CardMetricProps extends Omit<ComponentProps<'div'>, 'value' | 'onClick'> {
  title: string
  unit?: string
  status?: 'GREEN' | 'YELLOW' | 'RED'
  description?: string
  isLoading?: boolean
  hasModalLink?: boolean
  icon?: IconName
  onClick?: ComponentProps<'button'>['onClick']
}

export function CardMetric({
  title,
  unit,
  status,
  description,
  isLoading = true,
  className,
  hasModalLink = false,
  icon,
  onClick,
  ...props
}: CardMetricProps) {
  return (
    <Section
      className={twMerge('h-full w-full justify-center rounded border border-neutral-250 p-4', className)}
      {...props}
    >
      <div className="flex flex-col justify-between gap-0.5">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <Skeleton className="items-center gap-1.5" show={isLoading} width={170} height={16}>
              <Heading weight="medium">{title}</Heading>
              {status && (
                <Tooltip content="Default threshold is 250ms for percentiles">
                  <Badge
                    className={clsx('ml-1.5 gap-1 font-medium', {
                      'bg-green-50': status === 'GREEN',
                      'bg-red-50': status === 'RED',
                    })}
                    color={status === 'RED' ? 'red' : 'green'}
                    size="base"
                  >
                    <Icon iconName={status === 'GREEN' ? 'circle-check' : 'circle-exclamation'} iconStyle="regular" />
                    {status === 'GREEN' ? 'Healthy' : 'Unhealthy'}
                  </Badge>
                </Tooltip>
              )}
            </Skeleton>
          </div>
          <CardMetricButton hasModalLink={hasModalLink} icon={icon} onClick={onClick} />
        </div>
        {description && (
          <Skeleton show={isLoading} width={100} height={16}>
            <p className="text-ssm text-neutral-350">{description}</p>
          </Skeleton>
        )}
      </div>
    </Section>
  )
}

export default CardMetric
