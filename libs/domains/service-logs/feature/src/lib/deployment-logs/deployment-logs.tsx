import { type QueryClient } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import {
  type DeploymentStageWithServicesStatuses,
  type Environment,
  type EnvironmentStatus,
  type EnvironmentStatusesWithStagesPreCheckStage,
} from 'qovery-typescript-axios'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { Skeleton } from '@qovery/shared/ui'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import { ServiceStageIdsProvider } from '../service-stage-ids-context/service-stage-ids-context'
import { DeploymentLogsContent } from './deployment-logs-content/deployment-logs-content'
import { LoaderPlaceholder } from './deployment-logs-placeholder/deployment-logs-placeholder'

function Loader() {
  return (
    <div className="flex h-[calc(100vh-208px)] flex-col">
      <div className="flex h-12 items-center gap-[30px] border-b border-neutral px-4">
        <Skeleton width={105} height={28} />
        <Skeleton width={124} height={28} />
        <Skeleton width={80} height={28} />
        <Skeleton width={305} height={28} />
      </div>

      <div className="flex h-[calc(100%-48px)] flex-col items-center justify-between">
        <div className="flex h-full flex-col items-center justify-center">
          <LoaderPlaceholder />
        </div>
      </div>
    </div>
  )
}

function DeploymentLogsWrapper({
  environment,
  deploymentStages,
  environmentStatus,
  preCheckStage,
}: {
  environment?: Environment
  deploymentStages?: DeploymentStageWithServicesStatuses[]
  environmentStatus?: EnvironmentStatus
  preCheckStage?: EnvironmentStatusesWithStagesPreCheckStage
}) {
  if (!environment || !environmentStatus) {
    // Suspend until WS data arrives.
    // The parent Pipeline component will re-render this component once setEnvironmentStatus is called.
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    throw new Promise(() => {})
  }

  return (
    <div>
      <DeploymentLogsContent
        environment={environment}
        deploymentStages={deploymentStages}
        environmentStatus={environmentStatus}
        preCheckStage={preCheckStage}
      />
    </div>
  )
}

export function DeploymentLogs() {
  const { organizationId, projectId, environmentId, executionId } = useParams({ strict: false })

  const { data: environment } = useEnvironment({ environmentId, suspense: true })
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
      console.log('Deployment status update received')
      setDeploymentStages(stages)
      setEnvironmentStatus(environment)
      setPreCheckStage(pre_check_stage)
    },
    [setDeploymentStages]
  )

  const enabled =
    Boolean(organizationId) && Boolean(environment?.cluster_id) && Boolean(projectId) && Boolean(environmentId)

  useReactQueryWsSubscription({
    url: QOVERY_WS + '/deployment/status',
    urlSearchParams: {
      organization: organizationId,
      cluster: environment?.cluster_id,
      project: projectId,
      environment: environmentId,
      version: executionId,
    },
    enabled,
    onMessage: messageHandler,
  })

  useEffect(() => {
    // Reset local state when URL parameters change
    setDeploymentStages(undefined)
    setEnvironmentStatus(undefined)
    setPreCheckStage(undefined)
  }, [organizationId, projectId, environmentId, executionId])

  return (
    <div>
      <ServiceStageIdsProvider>
        <Suspense fallback={<Loader />}>
          <DeploymentLogsWrapper
            environment={environment}
            deploymentStages={deploymentStages}
            environmentStatus={environmentStatus}
            preCheckStage={preCheckStage}
          />
        </Suspense>
      </ServiceStageIdsProvider>
    </div>
  )
}
