import { ServiceTypeEnum } from 'qovery-typescript-axios'
import { ServiceSubActionDto } from 'qovery-ws-typescript-axios'
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
import useCheckRunningStatusClosed from '../../hooks/use-check-running-status-closed/use-check-running-status-closed'

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
  const stateLabel = service.runningStatus.stateLabel

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

  const value = match(service.runningStatus.triggered_action)
    .with({ sub_action: ServiceSubActionDto.TERRAFORM_PLAN_ONLY }, () => 'Plan ' + stateLabel.toLowerCase())
    .with({ sub_action: ServiceSubActionDto.TERRAFORM_PLAN_AND_APPLY }, () => 'Apply ' + stateLabel.toLowerCase())
    .with(
      { sub_action: ServiceSubActionDto.TERRAFORM_MIGRATE_STATE },
      () => 'Migrate state ' + stateLabel.toLowerCase()
    )
    .with(
      { sub_action: ServiceSubActionDto.TERRAFORM_FORCE_UNLOCK_STATE },
      () => 'Force unlock ' + stateLabel.toLowerCase()
    )
    .with({ sub_action: ServiceSubActionDto.TERRAFORM_DESTROY }, () => 'Destroy ' + stateLabel.toLocaleString())
    .with({ sub_action: ServiceSubActionDto.NONE }, () => stateLabel)
    .with(undefined, () => stateLabel)
    .exhaustive()

  if (checkRunningStatusClosed) {
    return (
      <Wrapper>
        <Tooltip content="See cluster">
          <Link
            as="button"
            to={CLUSTER_URL(organizationId, environment)}
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
                .with({ serviceType: 'DATABASE', mode: 'MANAGED' }, (s) => s.deploymentStatus?.state)
                .otherwise((s) => s.runningStatus?.state)}
            />
            {value}
          </Link>
        </Tooltip>
      </Skeleton>
    </Wrapper>
  )
}
