import { type QueryClient } from '@tanstack/react-query'
import { type DeploymentStageWithServicesStatuses, type EnvironmentStatus } from 'qovery-typescript-axios'
import { useCallback, useState } from 'react'
import { Route, Routes, matchPath, useLocation, useParams } from 'react-router-dom'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { useServices } from '@qovery/domains/services/feature'
import {
  DEPLOYMENT_LOGS_URL,
  DEPLOYMENT_LOGS_VERSION_URL,
  ENVIRONMENT_LOGS_URL,
  SERVICE_LOGS_URL,
} from '@qovery/shared/routes'
import { Icon } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import DeploymentLogsFeature from './feature/deployment-logs-feature/deployment-logs-feature'
import PodLogsFeature from './feature/pod-logs-feature/pod-logs-feature'
import { ServiceStageIdsProvider } from './feature/service-stage-ids-context/service-stage-ids-context'
import Sidebar from './ui/sidebar/sidebar'

export function PageEnvironmentLogs() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()

  const { data: environment } = useEnvironment({ environmentId })

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

  const messageHandler = useCallback(
    (
      _: QueryClient,
      { stages, environment }: { stages: DeploymentStageWithServicesStatuses[]; environment: EnvironmentStatus }
    ) => {
      setStatusStages(stages)
      setEnvironmentStatus(environment)
    },
    [setStatusStages, setEnvironmentStatus]
  )
  useReactQueryWsSubscription({
    url: 'wss://ws.qovery.com/deployment/status',
    urlSearchParams: {
      organization: organizationId,
      cluster: environment?.cluster_id,
      project: projectId,
      environment: environmentId,
      version: versionId,
    },
    enabled:
      Boolean(organizationId) && Boolean(environment?.cluster_id) && Boolean(projectId) && Boolean(environmentId),
    onMessage: messageHandler,
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
            element={
              <DeploymentLogsFeature key={location.pathname} environment={environment} statusStages={statusStages} />
            }
          />
          <Route path={SERVICE_LOGS_URL()} element={<PodLogsFeature clusterId={environment?.cluster_id} />} />
        </Routes>
      </ServiceStageIdsProvider>
      {(location.pathname === `${ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId)}/` ||
        location.pathname === ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId)) && (
        <div className="m-1 flex min-h-full w-[calc(100%-8px)] justify-center rounded bg-neutral-650">
          <div className="mt-12 flex flex-col items-center">
            <Icon iconName="wrench" className="text-neutral-300" />
            <div className="font-medium text-neutral-300">
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
