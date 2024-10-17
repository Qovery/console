import { type QueryClient } from '@tanstack/react-query'
import {
  type DeploymentStageWithServicesStatuses,
  type EnvironmentStatus,
  type EnvironmentStatusesWithStagesPreCheckStage,
} from 'qovery-typescript-axios'
import { useCallback, useState } from 'react'
import { Navigate, Route, Routes, matchPath, useLocation, useParams } from 'react-router-dom'
import { EnvironmentStages } from '@qovery/domains/environment-logs/feature'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { ServiceStageIdsProvider } from '@qovery/domains/service-logs/feature'
import {
  DEPLOYMENT_LOGS_URL,
  DEPLOYMENT_LOGS_VERSION_URL,
  ENVIRONMENT_LOGS_URL,
  ENVIRONMENT_STAGES_URL,
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

  const matchEnvironmentStageVersion = matchPath<'versionId', string>(
    ENVIRONMENT_LOGS_URL() + ENVIRONMENT_STAGES_URL(':versionId'),
    location.pathname
  )
  const matchDeploymentVersion = matchPath<'versionId' | 'serviceId', string>(
    ENVIRONMENT_LOGS_URL() + DEPLOYMENT_LOGS_VERSION_URL(),
    location.pathname
  )

  const deploymentVersionId =
    matchDeploymentVersion?.params.versionId !== ':versionId' ? matchDeploymentVersion?.params.versionId : undefined

  const stageVersionId =
    matchEnvironmentStageVersion?.params.versionId !== ':versionId'
      ? matchEnvironmentStageVersion?.params.versionId
      : undefined

  const [deploymentStages, setDeploymentStages] = useState<DeploymentStageWithServicesStatuses[]>()
  const [environmentStatus, setEnvironmentStatus] = useState<EnvironmentStatus>()
  const [preCheckStage, setPreCheckStage] = useState<EnvironmentStatusesWithStagesPreCheckStage>()

  const messageHandler = useCallback(
    (
      _: QueryClient,
      {
        stages,
        environment,
        pre_check_stage,
      }: {
        stages: DeploymentStageWithServicesStatuses[]
        environment: EnvironmentStatus
        pre_check_stage: EnvironmentStatusesWithStagesPreCheckStage
      }
    ) => {
      setDeploymentStages(stages)
      setEnvironmentStatus(environment)
      setPreCheckStage(pre_check_stage)
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
      version: deploymentVersionId || stageVersionId,
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
            path={ENVIRONMENT_STAGES_URL()}
            element={
              <EnvironmentStages
                environment={environment}
                environmentStatus={environmentStatus}
                deploymentStages={deploymentStages}
                preCheckStage={preCheckStage}
              />
            }
          />
          <Route
            path={ENVIRONMENT_STAGES_URL(':versionId')}
            element={
              <EnvironmentStages
                environment={environment}
                environmentStatus={environmentStatus}
                deploymentStages={deploymentStages}
                preCheckStage={preCheckStage}
              />
            }
          />
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
          <Route
            path="*"
            element={
              <Navigate
                to={ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + ENVIRONMENT_STAGES_URL()}
              />
            }
          />
        </Routes>
      </ServiceStageIdsProvider>
    </div>
  )
}

export default PageEnvironmentLogs
