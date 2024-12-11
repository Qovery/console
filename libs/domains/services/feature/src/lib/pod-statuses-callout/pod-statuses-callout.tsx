import { type IconName } from '@fortawesome/fontawesome-common-types'
import { type ReactNode, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { APPLICATION_SETTINGS_DOMAIN_URL, APPLICATION_SETTINGS_URL, APPLICATION_URL } from '@qovery/shared/routes'
import { Button, Callout, type CalloutRootProps, Icon, IconAwesomeEnum } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { useCleanFailedJobs } from '../hooks/use-clean-failed-jobs/use-clean-failed-jobs'
import { useRunningStatus } from '../hooks/use-running-status/use-running-status'
import { useServiceType } from '../hooks/use-service-type/use-service-type'

export interface PodStatusesCalloutProps {
  environmentId: string
  serviceId: string
}

export function PodStatusesCallout({ environmentId, serviceId }: PodStatusesCalloutProps) {
  const navigate = useNavigate()
  const { organizationId = '', projectId = '' } = useParams()
  const { data: runningStatuses, isLoading: isRunningStatusesLoading } = useRunningStatus({ environmentId, serviceId })
  const { data: serviceType, isLoading: isServiceTypeLoading } = useServiceType({ environmentId, serviceId })
  const { mutate: cleanFailedJobs } = useCleanFailedJobs()
  const [activeIndex, setActiveIndex] = useState(0)

  if (isRunningStatusesLoading || !runningStatuses || isServiceTypeLoading) {
    return null
  }

  const callouts: {
    id: number
    icon: IconName
    color: CalloutRootProps['color']
    title: string
    description?: ReactNode
    children?: ReactNode
  }[] = []

  if (runningStatuses.state === 'ERROR') {
    callouts.push({
      id: 1,
      icon: 'circle-exclamation',
      color: 'red',
      title: serviceType === 'JOB' ? 'Job execution failure' : 'Application pods are in error',
      description:
        serviceType === 'JOB'
          ? 'One of the job executions have failed. Have a look at the table below for investigation.'
          : 'Some pods are experiencing issues. Have a look at the table below for investigation.',
      children:
        serviceType === 'JOB' && environmentId && serviceId ? (
          <div className="flex flex-row items-center">
            <Button
              type="button"
              color="neutral"
              variant="outline"
              size="md"
              onClick={() => cleanFailedJobs({ environmentId, payload: { job_ids: [serviceId] } })}
            >
              Clear status
            </Button>
          </div>
        ) : undefined,
    })
  }

  if (runningStatuses.state === 'WARNING' || runningStatuses.state === 'ERROR') {
    const certificatesInError =
      'certificates' in runningStatuses && runningStatuses.certificates.filter(({ state }) => state === 'ERROR')
    if (certificatesInError && certificatesInError.length > 0) {
      callouts.push({
        id: 3,
        icon: 'circle-exclamation',
        color: 'red',
        title: 'Certificate Issues',
        description:
          'One or more certificates couldn’t be generated for your domains. Have a look at the domain section to know more.',
        children: (
          <div className="flex flex-row items-center">
            <Button
              type="button"
              color="neutral"
              variant="outline"
              className="text-md gap-2"
              size="md"
              onClick={() =>
                navigate(
                  APPLICATION_URL(organizationId, projectId, environmentId, serviceId) +
                    APPLICATION_SETTINGS_URL +
                    APPLICATION_SETTINGS_DOMAIN_URL
                )
              }
            >
              Domain settings
              <Icon iconName="gear-complex" iconStyle="regular" />
            </Button>
          </div>
        ),
      })
    } else {
      callouts.push({
        id: 2,
        icon: 'circle-exclamation',
        color: 'yellow',
        title: 'Application pods have experienced issues in the past',
        description: 'Some pods experienced issues in the past. Have a look at the table below for investigation.',
        children:
          serviceType === 'JOB' && environmentId && serviceId ? (
            <div className="flex flex-row items-center">
              <Button
                type="button"
                color="neutral"
                variant="outline"
                size="md"
                onClick={() => cleanFailedJobs({ environmentId, payload: { job_ids: [serviceId] } })}
              >
                Clear status
              </Button>
            </div>
          ) : undefined,
      })
    }
  }

  if (callouts.length === 0) {
    callouts.push({
      id: 4,
      icon: 'circle-check',
      color: 'green',
      title: `Service status: ${upperCaseFirstLetter(runningStatuses.state)}`,
    })
  }

  return (
    <>
      {callouts
        .filter((_, index) => index === activeIndex)
        .map(({ id, icon, color, children, title, description: description }) => (
          <Callout.Root color={color} key={id}>
            <Callout.Icon>
              <Icon iconName={icon} iconStyle="regular" />
            </Callout.Icon>
            <Callout.Text>
              <Callout.TextHeading>
                {callouts.length > 1 ? `${activeIndex + 1}/${callouts.length} ` : undefined}
                {title}
              </Callout.TextHeading>
              <Callout.TextDescription>{description}</Callout.TextDescription>
            </Callout.Text>
            {children}
            <div className="flex flex-row items-center gap-1.5">
              {callouts.length > 1 && (
                <>
                  <Button
                    type="button"
                    color="neutral"
                    variant="outline"
                    size="md"
                    disabled={activeIndex === 0}
                    onClick={() => setActiveIndex((index) => index - 1)}
                  >
                    <Icon className="px-1" iconName="chevron-left" />
                  </Button>
                  <Button
                    type="button"
                    color="neutral"
                    variant="outline"
                    size="md"
                    disabled={activeIndex === callouts.length - 1}
                    onClick={() => setActiveIndex((index) => index + 1)}
                  >
                    <Icon className="px-1" iconName="chevron-right" />
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
