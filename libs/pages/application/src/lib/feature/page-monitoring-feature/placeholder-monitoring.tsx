import { type IconName } from '@fortawesome/fontawesome-common-types'
import { Badge, Button, Heading, Icon, Section, Tooltip } from '@qovery/shared/ui'

function PlaceholderCard({
  title,
  description,
  status,
  icon,
}: {
  title: string
  description: string
  status?: 'GREEN' | 'RED'
  icon?: IconName
}) {
  return (
    <Section className="h-full w-full justify-center rounded border border-neutral-250 p-4">
      <div className="flex flex-col justify-between gap-0.5">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <Heading weight="medium">{title}</Heading>
            {status && (
              <Tooltip content="Default threshold is 250ms for percentiles">
                <Badge
                  className={`ml-1.5 gap-1 font-medium ${status === 'GREEN' ? 'bg-green-50' : 'bg-red-50'}`}
                  color={status === 'RED' ? 'red' : 'green'}
                  size="base"
                >
                  <Icon iconName={status === 'GREEN' ? 'circle-check' : 'circle-exclamation'} iconStyle="regular" />
                  {status === 'GREEN' ? 'Healthy' : 'Unhealthy'}
                </Badge>
              </Tooltip>
            )}
          </div>
          <Tooltip content="Show chart">
            <Button variant="outline" color="neutral" size="xs" className="w-6 items-center justify-center p-0">
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
        </div>
        <p className="text-ssm text-neutral-350">{description}</p>
      </div>
    </Section>
  )
}

function PlaceholderInstanceChart() {
  return (
    <Section className="h-full w-full rounded border border-neutral-250 p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heading weight="medium">Instances status</Heading>
            <Icon iconName="circle-info" iconStyle="regular" className="text-neutral-350" />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-neutral-350">Auto-scaling limit reached</span>
            <span className="text-xs text-neutral-350">Instance errors</span>
            <Tooltip content="Show chart">
              <Button variant="outline" color="neutral" size="xs" className="w-6 items-center justify-center p-0">
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
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="mt-6 flex h-[256px] flex-col items-center justify-between gap-2 bg-neutral-50">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex w-full items-center text-xs text-neutral-350">
            <div className="h-[1px] w-full bg-neutral-200" />
            <span className="w-5 text-right">{100 - index * 25}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-neutral-350">
        <span>03:00</span>
        <span>05:00</span>
        <span>07:00</span>
        <span>09:00</span>
        <span>11:00</span>
        <span>13:00</span>
        <span className="relative -left-4">15:00</span>
      </div>
    </Section>
  )
}

export function PlaceholderMonitoring() {
  return (
    <div className="pointer-events-none grid h-full gap-3 md:grid-cols-1 xl:grid-cols-2">
      <PlaceholderInstanceChart />
      <div className="flex h-full flex-col gap-3">
        <PlaceholderCard title="Log errors" description="on generated logs" icon="scroll" />

        <PlaceholderCard title="HTTP error rate" description="on requests" />

        <PlaceholderCard title="Max storage usage reached" description="% of your storage allowance" />

        <PlaceholderCard title="150ms network request duration" description="for p99" status="GREEN" />
      </div>
    </div>
  )
}
