import { useNavigate, useParams } from 'react-router-dom'
import { useEnvironmentDeploymentHistory } from '@qovery/domains/environment'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'

export function SidebarHistoryFeature() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const { data } = useEnvironmentDeploymentHistory(projectId, environmentId)

  const navigate = useNavigate()

  const pathLogs = ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId)

  return (
    <div className="flex justify-center border-b border-element-light-darker-100 px-4 py-3">
      <div>
        <div className="text-text-100 text-xs font-medium">Deployment - 1/10</div>
        <div className="text-text-100 text-xs">
          {data?.map((item, index) => (
            <div
              key={item.id}
              className="py-2"
              onClick={() => navigate(pathLogs + DEPLOYMENT_LOGS_VERSION_URL(environmentId, item.id))}
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
