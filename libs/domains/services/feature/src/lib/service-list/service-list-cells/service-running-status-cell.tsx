import { type Environment } from 'qovery-typescript-axios'
import { ServiceSubActionDto } from 'qovery-ws-typescript-axios'
import { type PropsWithChildren } from 'react'
import { match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import { Link, Skeleton, StatusChip, Tooltip } from '@qovery/shared/ui'
import { useCheckRunningStatusClosed } from '../../hooks/use-check-running-status-closed/use-check-running-status-closed'
import { useServiceDeploymentAndRunningStatuses } from '../../hooks/use-service-deployment-and-running-statuses/use-service-deployment-and-running-statuses'

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
  const { data } = useServiceDeploymentAndRunningStatuses({ environmentId: environment.id, service })
  const { runningStatus, deploymentStatus } = data

  const { data: checkRunningStatusClosed } = useCheckRunningStatusClosed({
    clusterId,
    environmentId: environment.id,
  })

  const Wrapper = ({ children }: PropsWithChildren) => <div className="min-w-40">{children}</div>

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
            to="/organization/$organizationId/cluster/$clusterId/overview"
            params={{ organizationId, clusterId: environment.cluster_id ?? '' }}
            onClick={(e) => e.stopPropagation()}
            className="gap-2 whitespace-nowrap text-sm"
            size="md"
            color="neutral"
            variant="outline"
            radius="full"
          >
            <StatusChip status="UNAVAILABLE" />
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
            to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview"
            params={{
              organizationId: environment.organization.id,
              projectId: environment.project.id,
              environmentId: environment.id,
              serviceId: service.id,
            }}
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
