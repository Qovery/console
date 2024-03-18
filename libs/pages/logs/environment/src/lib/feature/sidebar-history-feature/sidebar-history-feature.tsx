import { useLocation, useParams } from 'react-router-dom'
import { useDeploymentHistory } from '@qovery/domains/environments/feature'
import { useDeploymentStatus } from '@qovery/domains/environments/feature'
import { useServices } from '@qovery/domains/services/feature'
import { ENVIRONMENT_LOGS_URL, SERVICE_LOGS_URL } from '@qovery/shared/routes'
import SidebarHistory from '../../ui/sidebar-history/sidebar-history'

export interface SidebarHistoryFeatureProps {
  versionId?: string
  serviceId?: string
}

export function SidebarHistoryFeature({ versionId, serviceId }: SidebarHistoryFeatureProps) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const { data } = useDeploymentHistory({ environmentId })
  const { data: services } = useServices({ environmentId })
  const { data: deploymentStatus } = useDeploymentStatus({ environmentId })

  const { pathname } = useLocation()
  const pathLogs = ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId)
  const serviceLogsPath = pathname.includes(SERVICE_LOGS_URL(serviceId))

  const defaultServiceId = serviceId || services?.[0]?.id

  if (!data || !defaultServiceId || serviceLogsPath) return

  return (
    <SidebarHistory
      data={data}
      environmentState={deploymentStatus?.state}
      versionId={versionId}
      serviceId={defaultServiceId}
      pathLogs={pathLogs}
    />
  )
}

export default SidebarHistoryFeature
