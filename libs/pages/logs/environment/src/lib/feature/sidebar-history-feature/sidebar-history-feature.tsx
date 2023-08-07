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
    if (!versionId && serviceId !== '') {
      const firstVersionId = data?.[0]?.id || ''
      updateVersionId(firstVersionId)
      navigate(pathLogs + DEPLOYMENT_LOGS_VERSION_URL(serviceId, firstVersionId))
    }
  }, [navigate, serviceId, versionId, updateVersionId, data, pathLogs])

  if (!data) return

  return (
    <SidebarHistory data={data} versionId={versionId} serviceId={serviceId || applications[0].id} pathLogs={pathLogs} />
  )
}

export default SidebarHistoryFeature
