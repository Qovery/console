import { useSelector } from 'react-redux'
import { useLocation, useParams } from 'react-router-dom'
import { selectApplicationsEntitiesByEnvId } from '@qovery/domains/application'
import { useEnvironmentDeploymentHistory } from '@qovery/domains/environment'
import { ENVIRONMENT_LOGS_URL, SERVICE_LOGS_URL } from '@qovery/shared/routes'
import { RootState } from '@qovery/state/store'
import SidebarHistory from '../../ui/sidebar-history/sidebar-history'

export interface SidebarHistoryFeatureProps {
  versionId?: string
  serviceId?: string
}

export function SidebarHistoryFeature({ versionId, serviceId }: SidebarHistoryFeatureProps) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const { data } = useEnvironmentDeploymentHistory(projectId, environmentId)
  const applications = useSelector((state: RootState) => selectApplicationsEntitiesByEnvId(state, environmentId))

  const { pathname } = useLocation()
  const pathLogs = ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId)
  const serviceLogsPath = pathname.includes(SERVICE_LOGS_URL(serviceId))

  const defaultServiceId = serviceId || applications[0]?.id

  if (!data || !defaultServiceId || serviceLogsPath) return

  return <SidebarHistory data={data} versionId={versionId} serviceId={defaultServiceId} pathLogs={pathLogs} />
}

export default SidebarHistoryFeature
