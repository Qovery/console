import { type Environment, ServiceTypeEnum } from 'qovery-typescript-axios'
import { ServiceSubActionDto } from 'qovery-ws-typescript-axios'
import { useEffect } from 'react'
import { match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import {
  APPLICATION_URL,
  CLUSTER_URL,
  DATABASE_GENERAL_URL,
  DATABASE_URL,
  SERVICES_GENERAL_URL,
} from '@qovery/shared/routes'
import { Link, Skeleton, StatusChip, Tooltip } from '@qovery/shared/ui'
import { useCheckRunningStatusClosed } from '../../hooks/use-check-running-status-closed/use-check-running-status-closed'
import { useServiceDeploymentAndRunningStatuses } from '../../hooks/use-service-deployment-and-running-statuses/use-service-deployment-and-running-statuses'
import { useServicesListContext } from '../../hooks/use-services-list-context/use-services-list-context'

type ServiceRunningStatusCellProps = {
  service: AnyService
  organizationId: string
  projectId: string
  environment: Environment
  clusterId: string
}

export function ServiceRunningStatusCell({
  service,
  organizationId,
  projectId,
  environment,
  clusterId,
}: ServiceRunningStatusCellProps) {
  const { addStatusForService, statuses } = useServicesListContext()
  const { data } = useServiceDeploymentAndRunningStatuses({ environmentId: environment.id, service })
  const { runningStatus, deploymentStatus } = data

  // Setting the status in the context to be used in other cells and filters without needing to fetch it again
  useEffect(() => {
    if (
      data.runningStatus?.state !== statuses[service.id]?.runningStatus.state ||
      data.deploymentStatus?.state !== statuses[service.id]?.deploymentStatus?.state
    ) {
      addStatusForService(service.id, data)
    }
  }, [data, addStatusForService, service.id, statuses])

  const { data: checkRunningStatusClosed } = useCheckRunningStatusClosed({
    clusterId,
    environmentId: environment.id,
  })

  const Wrapper = ({ children }: { children: React.ReactNode }) => <div className="min-w-40">{children}</div>

  const link = match(service)
    .with(
      { serviceType: ServiceTypeEnum.DATABASE },
      ({ id }) => DATABASE_URL(organizationId, projectId, environment.id, id) + DATABASE_GENERAL_URL
    )
    .otherwise(({ id }) => APPLICATION_URL(organizationId, projectId, environment.id, id) + SERVICES_GENERAL_URL)

  const value = match(runningStatus?.triggered_action)
    .with(
      { sub_action: ServiceSubActionDto.TERRAFORM_PLAN_ONLY },
      () => 'Plan ' + runningStatus?.stateLabel?.toLowerCase()
    )
    .with(
      { sub_action: ServiceSubActionDto.TERRAFORM_PLAN_AND_APPLY },
      () => 'Apply ' + runningStatus?.stateLabel?.toLowerCase()
    )
    .with(
      { sub_action: ServiceSubActionDto.TERRAFORM_MIGRATE_STATE },
      () => 'Migrate state ' + runningStatus?.stateLabel?.toLowerCase()
    )
    .with(
      { sub_action: ServiceSubActionDto.TERRAFORM_FORCE_UNLOCK_STATE },
      () => 'Force unlock ' + runningStatus?.stateLabel?.toLowerCase()
    )
    .with(
      { sub_action: ServiceSubActionDto.TERRAFORM_DESTROY },
      () => 'Destroy ' + runningStatus?.stateLabel?.toLowerCase()
    )
    .with({ sub_action: ServiceSubActionDto.NONE }, () => runningStatus?.stateLabel)
    .with(undefined, () => runningStatus?.stateLabel)
    .exhaustive()

  if (checkRunningStatusClosed) {
    return (
      <Wrapper>
        <Tooltip content="See cluster">
          <Link
            as="button"
            to={CLUSTER_URL(organizationId, environment.id)}
            onClick={(e) => e.stopPropagation()}
            className="gap-2 whitespace-nowrap text-sm"
            size="md"
            color="neutral"
            variant="outline"
            radius="full"
          >
            <StatusChip status="STOPPED" />
            Status unavailable
          </Link>
        </Tooltip>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <Skeleton width={102} height={34} show={!value}>
        <Tooltip content="See overview">
          <Link
            as="button"
            to={link}
            onClick={(e) => e.stopPropagation()}
            className="gap-2 whitespace-nowrap text-sm"
            size="md"
            color="neutral"
            variant="outline"
            radius="full"
          >
            <StatusChip
              status={match(service)
                .with({ serviceType: 'DATABASE', mode: 'MANAGED' }, () => deploymentStatus?.state)
                .otherwise(() => runningStatus?.state)}
            />
            {value}
          </Link>
        </Tooltip>
      </Skeleton>
    </Wrapper>
  )
}
