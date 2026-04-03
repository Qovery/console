import { type QueryClient } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import {
  type DeploymentStageWithServicesStatuses,
  type Environment,
  type EnvironmentStatus,
  type EnvironmentStatusesWithStagesPreCheckStage,
} from 'qovery-typescript-axios'
import { memo, useCallback, useEffect, useState } from 'react'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { useService } from '@qovery/domains/services/feature'
import { Skeleton } from '@qovery/shared/ui'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { MetricsWebSocketListener } from '@qovery/shared/util-web-sockets'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import { ServiceStageIdsProvider } from '../service-stage-ids-context/service-stage-ids-context'
import { DeploymentLogsContent } from './deployment-logs-content/deployment-logs-content'
import { LoaderPlaceholder } from './deployment-logs-placeholder/deployment-logs-placeholder'

const WebSocketListenerMemo = memo(MetricsWebSocketListener)

function Loader() {
  return (
    <div className="flex h-[calc(100vh-125px)] flex-col">
      <div className="flex h-12 items-center gap-3 border-b border-neutral px-4">
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
    return <Loader />
  }

  return (
    <DeploymentLogsContent
      environment={environment}
      deploymentStages={deploymentStages}
      environmentStatus={environmentStatus}
      preCheckStage={preCheckStage}
    />
  )
}

export function DeploymentLogs() {
  const {
    organizationId,
    projectId,
    environmentId = '',
    serviceId = '',
    executionId = '',
  } = useParams({ strict: false })
  const { data: service } = useService({
    environmentId,
    serviceId,
    suspense: true,
  })
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
    // Reset page-level deployment state only when the overall scope changes.
    setDeploymentStages(undefined)
    setEnvironmentStatus(undefined)
    setPreCheckStage(undefined)
  }, [organizationId, projectId, environmentId])

  return (
    <div>
      <ServiceStageIdsProvider>
        <DeploymentLogsWrapper
          environment={environment}
          deploymentStages={deploymentStages}
          environmentStatus={environmentStatus}
          preCheckStage={preCheckStage}
        />

        {service && environment && (
          <WebSocketListenerMemo
            organizationId={environment.organization.id}
            clusterId={environment.cluster_id}
            projectId={environment.project.id}
            environmentId={environment.id}
            serviceId={service.id}
            serviceType={service.serviceType}
          />
        )}
      </ServiceStageIdsProvider>
    </div>
  )
}
