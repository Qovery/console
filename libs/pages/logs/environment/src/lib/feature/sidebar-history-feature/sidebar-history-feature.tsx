import { useContext, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useEnvironmentDeploymentHistory } from '@qovery/domains/environment'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { ServiceStageIdsContext } from '../service-stage-ids-context/service-stage-ids-context'

export function SidebarHistoryFeature() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const { data } = useEnvironmentDeploymentHistory(projectId, environmentId)
  const { serviceId, versionId, updateVersionId } = useContext(ServiceStageIdsContext)
  const navigate = useNavigate()

  const pathLogs = ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId)

  useEffect(() => {
    if (!versionId && serviceId !== '') {
      const firstVersionId = data?.[0]?.id || ''
      updateVersionId(firstVersionId)
      navigate(pathLogs + DEPLOYMENT_LOGS_VERSION_URL(serviceId, firstVersionId))
    }
  }, [navigate, serviceId, versionId, updateVersionId, data, pathLogs])

  const currentIndex = (data?.findIndex((item) => item.id === versionId) || 0) + 1

  return (
    <div className="flex justify-center border-b border-element-light-darker-100 px-4 py-3">
      <div>
        <div className="text-text-100 text-xs font-medium">Deployment - {currentIndex}/10</div>
        <div>
          {data?.map((item, index) => (
            <div
              key={item.id}
              className={`py-2 text-xs ${item.id === versionId ? 'text-brand-400' : 'text-text-100'}`}
              onClick={() => {
                navigate(pathLogs + DEPLOYMENT_LOGS_VERSION_URL(serviceId, item.id))
              }}
            >
              {index + 1}/{data.length} {item.id}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SidebarHistoryFeature
