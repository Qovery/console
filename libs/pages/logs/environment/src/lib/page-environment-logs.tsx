import { type QueryClient } from '@tanstack/react-query'
import { type DeploymentStageWithServicesStatuses, type EnvironmentStatus } from 'qovery-typescript-axios'
import { useCallback, useState } from 'react'
import { Route, Routes, matchPath, useLocation, useParams } from 'react-router-dom'
import { EnvironmentStages } from '@qovery/domains/environment-logs/feature'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { ServiceStageIdsProvider } from '@qovery/domains/service-logs/feature'
import {
  DEPLOYMENT_LOGS_URL,
  DEPLOYMENT_LOGS_VERSION_URL,
  ENVIRONMENT_LOGS_URL,
  SERVICE_LOGS_URL,
} from '@qovery/shared/routes'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import DeploymentLogsFeature from './feature/deployment-logs-feature/deployment-logs-feature'
import PodLogsFeature from './feature/pod-logs-feature/pod-logs-feature'

export function PageEnvironmentLogs() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const location = useLocation()
  const { data: environment } = useEnvironment({ environmentId })

  useDocumentTitle(`Environment logs ${environment ? `- ${environment?.name}` : '- Loading...'}`)

  const matchDeploymentVersion = matchPath<'versionId' | 'serviceId', string>(
    ENVIRONMENT_LOGS_URL() + DEPLOYMENT_LOGS_VERSION_URL(),
    location.pathname
  )

  const versionId =
    matchDeploymentVersion?.params.versionId !== ':versionId' ? matchDeploymentVersion?.params.versionId : undefined

  const [deploymentStages, setDeploymentStages] = useState<DeploymentStageWithServicesStatuses[]>()
  const [environmentStatus, setEnvironmentStatus] = useState<EnvironmentStatus>()

  const messageHandler = useCallback(
    (
      _: QueryClient,
      { stages, environment }: { stages: DeploymentStageWithServicesStatuses[]; environment: EnvironmentStatus }
    ) => {
      setDeploymentStages(stages)
      setEnvironmentStatus(environment)
    },
    [setDeploymentStages]
  )
  useReactQueryWsSubscription({
    url: QOVERY_WS + '/deployment/status',
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
        <Routes>
          <Route
            path={DEPLOYMENT_LOGS_URL()}
            element={
              <DeploymentLogsFeature
                environment={environment}
                deploymentStages={deploymentStages}
                environmentStatus={environmentStatus}
              />
            }
          />
          <Route
            path={DEPLOYMENT_LOGS_VERSION_URL()}
            element={
              <DeploymentLogsFeature
                key={location.pathname}
                environment={environment}
                deploymentStages={deploymentStages}
                environmentStatus={environmentStatus}
              />
            }
          />
          <Route
            path={SERVICE_LOGS_URL()}
            element={
              <PodLogsFeature
                environment={environment}
                deploymentStages={deploymentStages}
                environmentStatus={environmentStatus}
              />
            }
          />
        </Routes>
      </ServiceStageIdsProvider>
      {(location.pathname === `${ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId)}/` ||
        location.pathname === ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId)) && (
        <EnvironmentStages
          environment={environment}
          environmentStatus={environmentStatus}
          deploymentStages={deploymentStages}
        />
      )}
    </div>
  )
}

export default PageEnvironmentLogs
