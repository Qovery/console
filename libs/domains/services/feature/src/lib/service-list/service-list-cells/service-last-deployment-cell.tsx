import { type AnyService } from '@qovery/domains/services/data-access'
import { Icon, Link, Tooltip } from '@qovery/shared/ui'
import { dateUTCString, timeAgo } from '@qovery/shared/util-dates'
import useDeploymentStatus from '../../hooks/use-deployment-status/use-deployment-status'

type ServiceLastDeploymentCellProps = {
  service: AnyService
  organizationId: string
  projectId: string
  environmentId: string
  timeLabelOverride?: string
}

export function ServiceLastDeploymentCell({
  service,
  organizationId,
  projectId,
  environmentId,
  timeLabelOverride,
}: ServiceLastDeploymentCellProps) {
  const hasTimeOverride = Boolean(timeLabelOverride)
  const { data: deploymentStatus } = useDeploymentStatus({
    environmentId: hasTimeOverride ? undefined : environmentId,
    serviceId: hasTimeOverride ? undefined : service.id,
  })
  const date = deploymentStatus?.last_deployment_date

  if (timeLabelOverride) {
    return <span className="block w-full text-right text-ssm font-normal text-neutral-subtle">{timeLabelOverride}</span>
  }

  return date ? (
    <Link
      to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/service-logs"
      params={{ organizationId, projectId, environmentId, serviceId: service.id }}
      search={{
        deploymentId: deploymentStatus?.execution_id,
      }}
      className="group flex w-full translate-x-3 justify-end gap-1 text-right text-neutral-subtle hover:translate-x-0 hover:text-neutral"
      onClick={(event) => event.stopPropagation()}
    >
      <Tooltip content={dateUTCString(date)} delayDuration={200}>
        <span className="whitespace-nowrap text-ssm font-normal">{timeAgo(new Date(date))}</span>
      </Tooltip>
      <Icon iconName="arrow-up-right" iconStyle="regular" className="text-ssm opacity-0 group-hover:opacity-100" />
    </Link>
  ) : (
    <span className="block w-full text-right">-</span>
  )
}
