import { StatusLabel, type StatusLabelProps, Tooltip } from '@qovery/shared/ui'
import { dateFullFormat, timeAgo } from '@qovery/shared/utils'
import { useDeploymentStatus } from '../hooks/use-deployment-status/use-deployment-status'
import { useListStatuses } from '../hooks/use-list-statuses/use-list-statuses'

export interface ServiceDeploymentStatusLabelProps extends Omit<StatusLabelProps, 'status'> {
  environmentId?: string
  serviceId?: string
}

export function ServiceDeploymentStatusLabel({
  environmentId,
  serviceId,
  ...props
}: ServiceDeploymentStatusLabelProps) {
  let { data: deploymentStatus } = useDeploymentStatus({ environmentId, serviceId })
  // NOTE: Deployment status by WS isn't enough because WS can something return no message.
  // We need to fallback on service status, unfortunately play with endpoints to get
  // a service status without knowing its type (eg. application, container ...)
  const { data: environmentStatus } = useListStatuses({ environmentId })
  const serviceStatuses = [
    ...(environmentStatus?.applications ?? []),
    ...(environmentStatus?.containers ?? []),
    ...(environmentStatus?.databases ?? []),
    ...(environmentStatus?.jobs ?? []),
  ]
  deploymentStatus ??= serviceStatuses.find(({ id }) => id === serviceId)
  return (
    <div className="flex items-center gap-3 leading-7 text-neutral-350 text-sm">
      <StatusLabel status={deploymentStatus?.state} {...props} />
      {deploymentStatus?.last_deployment_date && (
        <Tooltip content={dateFullFormat(deploymentStatus.last_deployment_date)}>
          <span className="text-xs text-neutral-300 font-medium">
            {timeAgo(new Date(deploymentStatus.last_deployment_date))} ago
          </span>
        </Tooltip>
      )}
    </div>
  )
}

export default ServiceDeploymentStatusLabel
