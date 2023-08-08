import { useContext, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { selectApplicationsEntitiesByEnvId } from '@qovery/domains/application'
import { useEnvironmentDeploymentHistory } from '@qovery/domains/environment'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { RootState } from '@qovery/store'
import SidebarHistory from '../../ui/sidebar-history/sidebar-history'
import { ServiceStageIdsContext } from '../service-stage-ids-context/service-stage-ids-context'

export function SidebarHistoryFeature() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const { data } = useEnvironmentDeploymentHistory(projectId, environmentId)
  const { serviceId, versionId, updateVersionId } = useContext(ServiceStageIdsContext)
  const navigate = useNavigate()
  const applications = useSelector((state: RootState) => selectApplicationsEntitiesByEnvId(state, environmentId))

  const pathLogs = ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId)

  useEffect(() => {
    if (!versionId) {
      const firstVersionId = data?.[0]?.id || ''
      // adding the first versionId if not defined
      updateVersionId(firstVersionId)
      // navigate to deployment logs view
      if (serviceId) {
        navigate(
          ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) +
            DEPLOYMENT_LOGS_VERSION_URL(serviceId, firstVersionId)
        )
      }
    }
  }, [organizationId, projectId, environmentId, serviceId, versionId, navigate, updateVersionId, data])

  if (!data) return

  const defaultServiceId = serviceId || applications[0]?.id || ''

  return <SidebarHistory data={data} versionId={versionId} serviceId={defaultServiceId} pathLogs={pathLogs} />
}

export default SidebarHistoryFeature
