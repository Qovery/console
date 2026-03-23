import { type IconName } from '@fortawesome/fontawesome-common-types'
import { P, match } from 'ts-pattern'
import { EmptyState as EmptyStateComponent } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { useDeploymentStatus } from '../../hooks/use-deployment-status/use-deployment-status'
import { useRunningStatus } from '../../hooks/use-running-status/use-running-status'
import { useService } from '../../hooks/use-service/use-service'

function Box({ title, description, icon = 'play' }: { title: string; description: string; icon?: IconName }) {
  return <EmptyStateComponent title={title} description={description} icon={icon} iconStyle="solid" />
}

export interface EmptyStateProps {
  environmentId: string
  serviceId: string
}

export function EmptyState({ environmentId, serviceId }: EmptyStateProps) {
  const { data: service } = useService({ environmentId, serviceId })
  const { data: deploymentStatus } = useDeploymentStatus({ serviceId, environmentId })
  const { data: runningStatus } = useRunningStatus({ serviceId, environmentId })

  if (!deploymentStatus) {
    return null
  }

  return match({
    service,
    deploymentState: deploymentStatus.state,
    serviceDeploymentState: deploymentStatus.service_deployment_status,
    runningState: runningStatus?.state,
  })
    .with({ service: { serviceType: 'JOB', job_type: 'LIFECYCLE' }, serviceDeploymentState: 'NEVER_DEPLOYED' }, () => (
      <Box title="Lifecycle job not deployed" description="Deploy it first" />
    ))
    .with({ service: { serviceType: 'JOB', job_type: 'LIFECYCLE' } }, () => (
      <Box
        title="Lifecycle job has never been executed"
        description="It will be executed on the selected environment event."
      />
    ))
    .with(
      { service: { serviceType: 'JOB', job_type: 'CRON' }, serviceDeploymentState: 'NEVER_DEPLOYED' },
      {
        service: { serviceType: 'JOB', job_type: 'CRON' },
        serviceDeploymentState: 'UP_TO_DATE',
        runningState: 'STOPPED',
      },
      {
        service: { serviceType: 'JOB', job_type: 'CRON' },
        serviceDeploymentState: 'UP_TO_DATE',
        deploymentState: P.not('DEPLOYED'),
        runningState: undefined,
      },
      () => <Box title="Cronjob not deployed" description="Deploy it first" />
    )
    .with({ service: { serviceType: 'JOB', job_type: 'CRON' } }, () => (
      <Box
        title="Cronjob has never been executed"
        description="It will be executed based on the configured scheduling."
      />
    ))
    .otherwise((s) => {
      const serviceType = s.service?.serviceType ?? 'Service'
      return (
        <Box
          title={`${upperCaseFirstLetter(serviceType)} is not running`}
          description={`Deploy the ${serviceType.toLowerCase()} first`}
        />
      )
    })
}

export default EmptyState
