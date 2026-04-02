import { type Environment } from 'qovery-typescript-axios'
import { ServiceSubActionDto } from 'qovery-ws-typescript-axios'
import { type PropsWithChildren, useContext } from 'react'
import { match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import { DevopsCopilotContext } from '@qovery/shared/devops-copilot/context'
import { Icon, Link, Skeleton, StatusChip, Tooltip } from '@qovery/shared/ui'
import { useCheckRunningStatusClosed } from '../../hooks/use-check-running-status-closed/use-check-running-status-closed'
import { useServiceDeploymentAndRunningStatuses } from '../../hooks/use-service-deployment-and-running-statuses/use-service-deployment-and-running-statuses'

type ServiceRunningStatusCellProps = {
  service: AnyService
  organizationId: string
  projectId: string
  environment: Environment
  clusterId: string
  statusLabelOverride?: 'Synced' | 'Out of sync'
}

export function ServiceRunningStatusCell({
  service,
  organizationId,
  projectId,
  environment,
  clusterId,
  statusLabelOverride,
}: ServiceRunningStatusCellProps) {
  const hasStatusOverride = Boolean(statusLabelOverride)
  const { data } = useServiceDeploymentAndRunningStatuses({
    environmentId: hasStatusOverride ? '' : environment.id,
    service: hasStatusOverride ? undefined : service,
  })
  const { runningStatus, deploymentStatus } = data
  const { setDevopsCopilotOpen, sendMessageRef } = useContext(DevopsCopilotContext)

  const { data: checkRunningStatusClosed } = useCheckRunningStatusClosed({
    clusterId: hasStatusOverride ? '' : clusterId,
    environmentId: hasStatusOverride ? '' : environment.id,
  })

  if (statusLabelOverride) {
    return (
      <div className="min-w-40">
        <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-neutral px-3 py-1 text-sm text-neutral">
          <StatusChip status={statusLabelOverride === 'Out of sync' ? 'WARNING' : 'DEPLOYED'} />
          {statusLabelOverride}
        </span>
      </div>
    )
  }

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

  const serviceStatus = match(service)
    .with({ serviceType: 'DATABASE', mode: 'MANAGED' }, () => deploymentStatus?.state)
    .otherwise(() => runningStatus?.state)

  const isError = serviceStatus?.includes('ERROR')

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
            <StatusChip status={serviceStatus} />
            {value}
            {isError && (
              <span
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                }}
              >
                <Tooltip
                  classNameContent="rounded-full"
                  side="bottom"
                  content={
                    <div
                      className="flex cursor-pointer items-center gap-1.5"
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        setDevopsCopilotOpen(true)
                        sendMessageRef?.current?.('Why did my deployment fail?')
                      }}
                    >
                      <Icon iconName="sparkles" iconStyle="solid" className="text-brand" />
                      <span className="text-sm">Ask AI Copilot for diagnostic</span>
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-neutral-component">
                        <Icon iconName="arrow-right" className="text-neutral-subtle" />
                      </div>
                    </div>
                  }
                >
                  <div
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      setDevopsCopilotOpen(true)
                      sendMessageRef?.current?.('Why did my deployment fail?')
                    }}
                    className="group cursor-pointer"
                  >
                    <Icon
                      iconName="sparkles"
                      iconStyle="solid"
                      className="text-neutral-subtle transition-colors group-hover:text-brand"
                    />
                  </div>
                </Tooltip>
              </span>
            )}
          </Link>
        </Tooltip>
      </Skeleton>
    </Wrapper>
  )
}
