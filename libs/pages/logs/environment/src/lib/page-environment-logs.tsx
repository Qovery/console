import { type QueryClient } from '@tanstack/react-query'
import {
  type DeploymentStageWithServicesStatuses,
  type EnvironmentStatus,
  type EnvironmentStatusesWithStagesPreCheckStage,
} from 'qovery-typescript-axios'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, Navigate, Route, Routes, matchPath, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useDeploymentHistory, useEnvironment } from '@qovery/domains/environments/feature'
import { ServiceStageIdsProvider } from '@qovery/domains/service-logs/feature'
import {
  DEPLOYMENT_LOGS_VERSION_URL,
  ENVIRONMENT_LOGS_URL,
  ENVIRONMENT_PRE_CHECK_LOGS_URL,
  ENVIRONMENT_STAGES_URL,
  SERVICE_LOGS_URL,
} from '@qovery/shared/routes'
import { LoaderDots, StatusChip } from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/util-dates'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { trimId } from '@qovery/shared/util-js'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import DeploymentLogsFeature from './feature/deployment-logs-feature/deployment-logs-feature'
import EnvironmentStagesFeature from './feature/environment-stages-feature/environment-stages-feature'
import PodLogsFeature from './feature/pod-logs-feature/pod-logs-feature'
import PreCheckLogsFeature from './feature/pre-check-logs-feature/pre-check-logs-feature'

export function PageEnvironmentLogs() {
  const { organizationId = '', projectId = '', environmentId = '', '*': rest } = useParams()
  const stageId = rest?.split('/')[0]
  const location = useLocation()
  const navigate = useNavigate()
  const { data: environment } = useEnvironment({ environmentId })
  const { data: environmentDeploymentHistory = [], isFetched: isFetchedDeploymentHistory } = useDeploymentHistory({
    environmentId,
  })

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

  const deploymentsCurrentlyDeploying = useMemo(
    () =>
      environmentDeploymentHistory.filter(
        (deployment) =>
          ['DEPLOYING', 'DEPLOYMENT_QUEUED'].includes(deployment.status) &&
          deployment.identifier.execution_id !== versionIdUrl
      ),
    [environmentDeploymentHistory, versionIdUrl]
  )

  // If the URL contains `/latest` and the deployment is deploying, redirect to the logs page with the correct execution ID
  useEffect(() => {
    const latestDeployment = deploymentsCurrentlyDeploying[0]
    const hasMatchingService =
      latestDeployment?.stages &&
      latestDeployment.stages.some((stage) =>
        stage.services.some((service) => service.identifier.service_id === stageId)
      )

    if (
      deploymentVersionId === 'latest' &&
      isFetchedDeploymentHistory &&
      ['DEPLOYING', 'DEPLOYMENT_QUEUED'].includes(latestDeployment?.status) &&
      latestDeployment.identifier.execution_id &&
      hasMatchingService
    ) {
      navigate(
        ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) +
          DEPLOYMENT_LOGS_VERSION_URL(stageId, latestDeployment.identifier.execution_id),
        { replace: true }
      )
    }
  }, [
    deploymentVersionId,
    navigate,
    stageId,
    deploymentsCurrentlyDeploying,
    organizationId,
    projectId,
    environmentId,
    isFetchedDeploymentHistory,
  ])

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

  const findDeploymentHistory = versionIdUrl
    ? environmentDeploymentHistory?.find((h) => h.identifier.execution_id === versionIdUrl)
    : true

  if (isFetchedDeploymentHistory && !findDeploymentHistory) {
    return (
      <div className="h-[calc(100vh-64px)] w-full p-1">
        <div className="flex h-full w-full items-center justify-center border border-neutral-500 bg-neutral-600">
          {deploymentVersionId === 'latest' ? (
            <div className="flex flex-col items-center justify-center gap-10">
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <LoaderDots />
                <div className="flex flex-col gap-3">
                  <p className="text-neutral-300">Please wait while we deploy your application.</p>
                  <span className="text-sm text-neutral-350">You will be redirected to the logs shortly.</span>
                </div>
              </div>
              {deploymentsCurrentlyDeploying.length > 0 && (
                <div className="w-[484px] overflow-hidden rounded-lg border border-neutral-500 bg-neutral-700">
                  <div className="border-b border-neutral-500 bg-neutral-600 py-3 text-center font-medium text-neutral-50">
                    Other ongoing deployments
                  </div>
                  <div className="max-h-96 overflow-y-auto p-2">
                    {deploymentsCurrentlyDeploying.map((deploymentHistory) => (
                      <div key={deploymentHistory.identifier.execution_id} className="flex items-center pb-2 last:pb-0">
                        <Link
                          className={`flex w-full justify-between rounded bg-neutral-550 p-3 transition hover:bg-neutral-600 `}
                          to={
                            ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) +
                            ENVIRONMENT_STAGES_URL(deploymentHistory.identifier.execution_id)
                          }
                        >
                          <span className="flex">
                            <StatusChip className="relative top-[2px] mr-3" status={deploymentHistory.status} />
                            <span className="text-ssm text-brand-300">
                              {trimId(deploymentHistory.identifier.execution_id || '')}
                            </span>
                          </span>
                          <span className="text-ssm text-neutral-300">
                            {dateFullFormat(deploymentHistory.auditing_data.created_at)}
                          </span>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" fill="none" viewBox="0 0 44 44">
                <g clipPath="url(#clip0_19290_138219)">
                  <path fill="#2A3041" d="M22 44c12.15 0 22-9.85 22-22S34.15 0 22 0 0 9.85 0 22s9.85 22 22 22"></path>
                  <path
                    fill="#A0AFC5"
                    d="M30.683 15.933a.45.45 0 0 0 0-.633L28.2 12.817a.45.45 0 0 0-.633 0l-1.246 1.246-4.004 4.004a.45.45 0 0 1-.634 0l-4.004-4.004-1.246-1.246a.45.45 0 0 0-.633 0L13.317 15.3a.45.45 0 0 0 0 .633l1.246 1.246 4.004 4.004a.45.45 0 0 1 0 .634l-4.004 4.004-1.246 1.246a.45.45 0 0 0 0 .633l2.483 2.483a.45.45 0 0 0 .633 0l1.246-1.246 4.004-4.004a.45.45 0 0 1 .634 0l4.004 4.004 1.246 1.246a.45.45 0 0 0 .633 0l2.483-2.483a.45.45 0 0 0 0-.633l-1.246-1.246-4.004-4.004a.45.45 0 0 1 0-.634l4.004-4.004z"
                  ></path>
                </g>
                <defs>
                  <clipPath id="clip0_19290_138219">
                    <path fill="#fff" d="M0 0h44v44H0z"></path>
                  </clipPath>
                </defs>
              </svg>
              <div className="flex flex-col gap-3">
                <p className="text-neutral-300">Deployment logs are no longer available due to the deployment's age.</p>
                <span className="text-sm text-neutral-350">No logs to display.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!environment || !environmentStatus?.last_deployment_state)
    return (
      <div className="h-[calc(100vh-64px)] w-full p-1">
        <div className="flex h-full w-full items-center justify-center border border-neutral-500 bg-neutral-600">
          <LoaderDots />
        </div>
      </div>
    )

  return (
    <div className="flex h-full flex-col">
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
                preCheckStage={preCheckStage}
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
