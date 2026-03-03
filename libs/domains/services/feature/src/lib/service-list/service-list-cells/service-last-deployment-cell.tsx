import { type AnyService } from '@qovery/domains/services/data-access'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { Icon, Link, Tooltip } from '@qovery/shared/ui'
import { dateUTCString, timeAgo } from '@qovery/shared/util-dates'
import useDeploymentStatus from '../../hooks/use-deployment-status/use-deployment-status'

type ServiceLastDeploymentCellProps = {
  service: AnyService
  organizationId: string
  projectId: string
  environmentId: string
}

export function ServiceLastDeploymentCell({
  service,
  organizationId,
  projectId,
  environmentId,
}: ServiceLastDeploymentCellProps) {
  const { data: deploymentStatus } = useDeploymentStatus({ environmentId: environmentId, serviceId: service.id })
  const date = deploymentStatus?.last_deployment_date
  const linkLog =
    ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) +
    DEPLOYMENT_LOGS_VERSION_URL(service?.id, deploymentStatus?.execution_id)

  return date ? (
    <Link
      to={linkLog}
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
