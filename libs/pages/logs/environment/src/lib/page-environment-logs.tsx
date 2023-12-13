import { type DeploymentStageWithServicesStatuses, type EnvironmentStatus } from 'qovery-typescript-axios'
import { useCallback, useState } from 'react'
import { Route, Routes, matchPath, useLocation, useParams } from 'react-router-dom'
import useWebSocket from 'react-use-websocket'
import { useFetchEnvironment } from '@qovery/domains/environment'
import { useServices } from '@qovery/domains/services/feature'
import { useAuth } from '@qovery/shared/auth'
import {
  DEPLOYMENT_LOGS_URL,
  DEPLOYMENT_LOGS_VERSION_URL,
  ENVIRONMENT_LOGS_URL,
  SERVICE_LOGS_URL,
} from '@qovery/shared/routes'
import { Icon, IconAwesomeEnum } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import DeploymentLogsFeature from './feature/deployment-logs-feature/deployment-logs-feature'
import PodLogsFeature from './feature/pod-logs-feature/pod-logs-feature'
import { ServiceStageIdsProvider } from './feature/service-stage-ids-context/service-stage-ids-context'
import Sidebar from './ui/sidebar/sidebar'

export function PageEnvironmentLogs() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()

  const { data: environment } = useFetchEnvironment(projectId, environmentId)

  useDocumentTitle(`Environment logs ${environment ? `- ${environment?.name}` : '- Loading...'}`)

  const location = useLocation()
  const matchDeployment = matchPath<'serviceId', string>(
    ENVIRONMENT_LOGS_URL() + DEPLOYMENT_LOGS_URL(),
    location.pathname
  )
  const matchDeploymentVersion = matchPath<'versionId' | 'serviceId', string>(
    ENVIRONMENT_LOGS_URL() + DEPLOYMENT_LOGS_VERSION_URL(),
    location.pathname
  )
  const matchServiceLogs = matchPath<'serviceId', string>(
    ENVIRONMENT_LOGS_URL() + SERVICE_LOGS_URL(),
    location.pathname
  )

  const versionId =
    matchDeploymentVersion?.params.versionId !== ':versionId' ? matchDeploymentVersion?.params.versionId : undefined

  const matchServiceId = matchDeploymentVersion || matchServiceLogs || matchDeployment
  const serviceId = matchServiceId?.params.serviceId !== ':serviceId' ? matchServiceId?.params.serviceId : undefined

  const { data: services } = useServices({ environmentId })

  const [statusStages, setStatusStages] = useState<DeploymentStageWithServicesStatuses[]>()
  const [environmentStatus, setEnvironmentStatus] = useState<EnvironmentStatus>()

  const { getAccessTokenSilently } = useAuth()

  const deploymentStatusWithVersionIdUrl: () => Promise<string> = useCallback(async () => {
    const url = `wss://ws.qovery.com/deployment/status?organization=${organizationId}&cluster=${
      environment?.cluster_id
    }&project=${projectId}&environment=${environmentId}${versionId ? `&version=${versionId}` : ''}`
    const token = await getAccessTokenSilently()

    return new Promise((resolve) => environment?.cluster_id && resolve(url + `&bearer_token=${token}`))
  }, [organizationId, environment?.cluster_id, projectId, environmentId, getAccessTokenSilently, versionId])

  useWebSocket(deploymentStatusWithVersionIdUrl, {
    onMessage: (message) => {
      setStatusStages(JSON.parse(message?.data).stages)
      setEnvironmentStatus(JSON.parse(message?.data).environment)
    },
  })

  if (!environment) return

  return (
    <div className="flex h-full">
      <ServiceStageIdsProvider>
        <Sidebar
          services={services}
          statusStages={statusStages}
          environmentStatus={environmentStatus}
          versionId={versionId}
          serviceId={serviceId}
        />
        <Routes>
          <Route
            path={DEPLOYMENT_LOGS_URL()}
            element={<DeploymentLogsFeature environment={environment} statusStages={statusStages} />}
          />
          <Route
            path={DEPLOYMENT_LOGS_VERSION_URL()}
            element={<DeploymentLogsFeature environment={environment} statusStages={statusStages} />}
          />
          <Route path={SERVICE_LOGS_URL()} element={<PodLogsFeature clusterId={environment?.cluster_id} />} />
        </Routes>
      </ServiceStageIdsProvider>
      {(location.pathname === `${ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId)}/` ||
        location.pathname === ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId)) && (
        <div className="flex justify-center w-[calc(100%-8px)] min-h-full bg-neutral-650 m-1 rounded">
          <div className="flex flex-col items-center mt-12">
            <Icon name={IconAwesomeEnum.WRENCH} className="text-neutral-300" />
            <div className="text-neutral-300 font-medium">
              Please select a service on the left menu to access its deployment logs or live logs.
              <p>
                You can access the deployment logs only for the services recently deployed (
                <span className="text-brand-400">in purple</span>).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PageEnvironmentLogs
