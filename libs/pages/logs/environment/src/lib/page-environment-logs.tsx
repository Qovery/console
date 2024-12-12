import { type QueryClient } from '@tanstack/react-query'
import {
  type DeploymentStageWithServicesStatuses,
  type EnvironmentStatus,
  type EnvironmentStatusesWithStagesPreCheckStage,
} from 'qovery-typescript-axios'
import { useCallback, useState } from 'react'
import { Navigate, Route, Routes, matchPath, useLocation, useParams } from 'react-router-dom'
import { useDeploymentHistory, useEnvironment } from '@qovery/domains/environments/feature'
import { ServiceStageIdsProvider } from '@qovery/domains/service-logs/feature'
import {
  DEPLOYMENT_LOGS_URL,
  DEPLOYMENT_LOGS_VERSION_URL,
  ENVIRONMENT_LOGS_URL,
  ENVIRONMENT_PRE_CHECK_LOGS_URL,
  ENVIRONMENT_STAGES_URL,
  SERVICE_LOGS_URL,
} from '@qovery/shared/routes'
import { LoaderSpinner } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import DeploymentLogsFeature from './feature/deployment-logs-feature/deployment-logs-feature'
import EnvironmentStagesFeature from './feature/environment-stages-feature/environment-stages-feature'
import PodLogsFeature from './feature/pod-logs-feature/pod-logs-feature'
import PreCheckLogsFeature from './feature/pre-check-logs-feature/pre-check-logs-feature'

// XXX: This is a workaround to redirect to the last deployment logs with (execution_id/last_deployment_id)
// We don't authorize to see the deployment without versionId
function RedirectDeploymentLogs({
  organizationId,
  projectId,
  environmentId,
  lastDeploymentId,
}: {
  organizationId: string
  projectId: string
  environmentId: string
  lastDeploymentId: string
}) {
  const { serviceId = '' } = useParams()
  return (
    <Navigate
      to={
        ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) +
        DEPLOYMENT_LOGS_VERSION_URL(serviceId, lastDeploymentId)
      }
    />
  )
}

export function PageEnvironmentLogs() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const location = useLocation()
  const { data: environment } = useEnvironment({ environmentId })
  const { data: environmentDeploymentHistory = [] } = useDeploymentHistory({ environmentId })

  useDocumentTitle(`Environment logs ${environment ? `- ${environment?.name}` : '- Loading...'}`)

  const matchEnvironmentStageVersion = matchPath<'versionId', string>(
    ENVIRONMENT_LOGS_URL() + ENVIRONMENT_STAGES_URL(':versionId'),
    location.pathname
  )
  const matchDeploymentVersion = matchPath<'versionId' | 'serviceId', string>(
    ENVIRONMENT_LOGS_URL() + DEPLOYMENT_LOGS_VERSION_URL(),
    location.pathname
  )
  const matchPreCheckVersion = matchPath<'versionId', string>(
    ENVIRONMENT_LOGS_URL() + ENVIRONMENT_PRE_CHECK_LOGS_URL(':versionId'),
    location.pathname
  )

  const deploymentVersionId =
    matchDeploymentVersion?.params.versionId !== ':versionId' ? matchDeploymentVersion?.params.versionId : undefined

  const preCheckVersionId =
    matchPreCheckVersion?.params.versionId !== ':versionId' ? matchPreCheckVersion?.params.versionId : undefined

  const stageVersionId =
    matchEnvironmentStageVersion?.params.versionId !== ':versionId'
      ? matchEnvironmentStageVersion?.params.versionId
      : undefined

  const [deploymentStages, setDeploymentStages] = useState<DeploymentStageWithServicesStatuses[]>()
  const [environmentStatus, setEnvironmentStatus] = useState<EnvironmentStatus>()
  const [preCheckStage, setPreCheckStage] = useState<EnvironmentStatusesWithStagesPreCheckStage>()

  const versionIdUrl = deploymentVersionId || preCheckVersionId || stageVersionId
  const isLatestVersion = environmentDeploymentHistory[0]?.identifier.execution_id === versionIdUrl

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
  // XXX: If we don't have a version, it works like WS otherwise, it works like a REST API
  useReactQueryWsSubscription({
    url: QOVERY_WS + '/deployment/status',
    urlSearchParams: {
      organization: organizationId,
      cluster: environment?.cluster_id,
      project: projectId,
      environment: environmentId,
      version: isLatestVersion ? undefined : versionIdUrl,
    },
    enabled:
      Boolean(organizationId) && Boolean(environment?.cluster_id) && Boolean(projectId) && Boolean(environmentId),
    onMessage: messageHandler,
  })

  if (!environment || !environmentStatus?.last_deployment_state)
    return (
      <div className="h-[calc(100vh-64px)] w-[calc(100vw-64px)] p-1">
        <div className="flex h-full w-full justify-center border border-neutral-500 bg-neutral-600 pt-11">
          <LoaderSpinner className="h-6 w-6" theme="dark" />
        </div>
      </div>
    )

  const lastDeploymentId = environmentStatus.last_deployment_id ?? ''

  return (
    <div className="flex h-full">
      <ServiceStageIdsProvider>
        <Routes>
          <Route
            path={ENVIRONMENT_STAGES_URL()}
            element={
              <EnvironmentStagesFeature
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
              <EnvironmentStagesFeature
                environment={environment}
                environmentStatus={environmentStatus}
                deploymentStages={deploymentStages}
                preCheckStage={preCheckStage}
              />
            }
          />
          <Route
            path={ENVIRONMENT_PRE_CHECK_LOGS_URL(':versionId')}
            element={<PreCheckLogsFeature environment={environment} preCheckStage={preCheckStage} />}
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
            path={DEPLOYMENT_LOGS_URL()}
            element={
              <RedirectDeploymentLogs
                organizationId={organizationId}
                projectId={projectId}
                environmentId={environmentId}
                lastDeploymentId={lastDeploymentId}
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
