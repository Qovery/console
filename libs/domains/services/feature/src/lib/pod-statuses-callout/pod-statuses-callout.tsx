import { type ReactNode, useState } from 'react'
import { Button, Callout, type CalloutRootProps, Icon, IconAwesomeEnum } from '@qovery/shared/ui'
import { useRunningStatus } from '../hooks/use-running-status/use-running-status'

export interface PodStatusesCalloutProps {
  environmentId: string
  serviceId: string
}

export function PodStatusesCallout({ environmentId, serviceId }: PodStatusesCalloutProps) {
  const { data: runningStatuses, isLoading: isRunningStatusesLoading } = useRunningStatus({ environmentId, serviceId })
  const [activeIndex, setActiveIndex] = useState(0)

  if (isRunningStatusesLoading || !runningStatuses) {
    return null
  }

  const callouts: {
    id: number
    icon: IconAwesomeEnum
    color: CalloutRootProps['color']
    title: string
    content: ReactNode
  }[] = []

  if (runningStatuses.pods.some(({ state }) => state === 'ERROR')) {
    callouts.push({
      id: 1,
      icon: IconAwesomeEnum.CIRCLE_EXCLAMATION,
      color: 'red',
      title: 'Application pods are in error',
      content: 'Some pods are experiencing issues. Have a look at the table below for investigation.',
    })
  }

  if (runningStatuses.pods.some(({ state }) => state === 'WARNING')) {
    callouts.push({
      id: 2,
      icon: IconAwesomeEnum.CIRCLE_EXCLAMATION,
      color: 'yellow',
      title: 'Application pods have experienced issues in the past',
      content: 'Some pods experienced issues in the past. Have a look at the table below for investigation.',
    })
  }

  if ('certificates' in runningStatuses) {
    const certificatesInError = runningStatuses.certificates.filter(({ state }) => state === 'ERROR')
    if (certificatesInError.length > 0) {
      callouts.push({
        id: 3,
        icon: IconAwesomeEnum.CHECK,
        color: 'red',
        title: 'Certificate Issues',
        content: (
          <>
            Couldn’t issue certificates for:
            <ul>
              {certificatesInError.map(({ dns_names, state_message }) =>
                dns_names.map((dns_name) => (
                  <li key={dns_name}>
                    {dns_name} {state_message}
                  </li>
                ))
              )}
            </ul>
            Ensure you have configured the right domain and check your DNS configuration.
            <br />
            <Button type="button" color="neutral" variant="outline">
              Domain settings
            </Button>
          </>
        ),
      })
    }
  }

  return (
    <>
      {callouts
        .filter((_, index) => index === activeIndex)
        .map(({ id, icon, color, title, content }) => (
          <Callout.Root color={color} key={id}>
            <Callout.Icon>
              <Icon name={icon} />
            </Callout.Icon>
            <Callout.Text>
              <Callout.TextHeading>{title}</Callout.TextHeading>
              <Callout.TextDescription>{content}</Callout.TextDescription>
            </Callout.Text>
            <div className="flex flex-row gap-1.5">
              {callouts.length > 1 && (
                <>
                  <Button
                    type="button"
                    color="neutral"
                    variant="outline"
                    disabled={activeIndex === 0}
                    onClick={() => setActiveIndex((index) => index - 1)}
                  >
                    <Icon className="px-1" name={IconAwesomeEnum.CHEVRON_LEFT} />
                  </Button>
                  <Button
                    type="button"
                    color="neutral"
                    variant="outline"
                    disabled={activeIndex === callouts.length - 1}
                    onClick={() => setActiveIndex((index) => index + 1)}
                  >
                    <Icon className="px-1" name={IconAwesomeEnum.CHEVRON_RIGHT} />
                  </Button>
                </>
              )}
            </div>
          </Callout.Root>
        ))}
    </>
  )
}

export default PodStatusesCallout
