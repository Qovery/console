import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { selectApplicationsEntitiesByEnvId } from '@qovery/domains/application'
import { useEnvironmentDeploymentHistory } from '@qovery/domains/environment'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL, SERVICE_LOGS_URL } from '@qovery/shared/routes'
import { RootState } from '@qovery/store'
import SidebarHistory from '../../ui/sidebar-history/sidebar-history'

export interface SidebarHistoryFeatureProps {
  versionId?: string
  serviceId?: string
}

export function SidebarHistoryFeature({ versionId, serviceId }: SidebarHistoryFeatureProps) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const { data } = useEnvironmentDeploymentHistory(projectId, environmentId)
  const navigate = useNavigate()
  const applications = useSelector((state: RootState) => selectApplicationsEntitiesByEnvId(state, environmentId))

  const { pathname } = useLocation()
  const pathLogs = ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId)
  const serviceLogsPath = pathname.includes(SERVICE_LOGS_URL(serviceId))

  useEffect(() => {
    if (!versionId && !serviceLogsPath) {
      const firstVersionId = data?.[0]?.id || ''
      if (serviceId) {
        navigate(
          ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) +
            DEPLOYMENT_LOGS_VERSION_URL(serviceId, firstVersionId)
        )
      }
    }
  }, [organizationId, projectId, environmentId, serviceId, versionId, navigate, data, serviceLogsPath])

  const defaultServiceId = serviceId || applications[0]?.id

  if (!data || !defaultServiceId) return

  return <SidebarHistory data={data} versionId={versionId} serviceId={defaultServiceId} pathLogs={pathLogs} />
}

export default SidebarHistoryFeature
