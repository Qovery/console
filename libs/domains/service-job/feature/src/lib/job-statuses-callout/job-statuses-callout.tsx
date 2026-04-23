import { match } from 'ts-pattern'
import { useCleanFailedJobs, useRunningStatus, useService } from '@qovery/domains/services/feature'
import { Button, Callout, Icon } from '@qovery/shared/ui'

export interface JobStatusesCalloutProps {
  environmentId: string
  serviceId: string
}

export function JobStatusesCallout({ environmentId, serviceId }: JobStatusesCalloutProps) {
  const { data: service } = useService({ environmentId, serviceId })
  const { data: runningStatus } = useRunningStatus({ environmentId, serviceId })
  const { mutate: cleanFailedJobs, isLoading: isCleaning } = useCleanFailedJobs()

  if (service?.serviceType !== 'JOB' || !runningStatus) {
    return null
  }

  const callout = match(runningStatus.state)
    .with('ERROR', () => ({
      color: 'red' as const,
      title: 'Job execution failure',
      description: 'One of the job executions have failed. Have a look at the table below for investigation.',
    }))
    .with('WARNING', () => ({
      color: 'yellow' as const,
      title: 'Application pods have experienced issues in the past',
      description: 'Some pods experienced issues in the past. Have a look at the table below for investigation.',
    }))
    .otherwise(() => null)

  if (!callout) {
    return null
  }

  return (
    <Callout.Root color={callout.color}>
      <Callout.Icon>
        <Icon iconName="circle-exclamation" iconStyle="regular" />
      </Callout.Icon>
      <Callout.Text>
        <Callout.TextHeading>{callout.title}</Callout.TextHeading>
        <Callout.TextDescription>{callout.description}</Callout.TextDescription>
      </Callout.Text>
      <Button
        type="button"
        color="neutral"
        variant="outline"
        size="md"
        loading={isCleaning}
        onClick={() => cleanFailedJobs({ environmentId, payload: { job_ids: [serviceId] } })}
      >
        Clear status
      </Button>
    </Callout.Root>
  )
}

export default JobStatusesCallout
