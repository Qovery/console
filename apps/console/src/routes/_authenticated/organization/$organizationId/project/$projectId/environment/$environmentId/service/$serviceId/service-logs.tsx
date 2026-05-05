import { type QueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  type DeploymentStageWithServicesStatuses,
  type EnvironmentStatus,
  type EnvironmentStatusesWithStagesPreCheckStage,
} from 'qovery-typescript-axios'
import { useCallback, useState } from 'react'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { PodLogsFeature, ServiceStageIdsProvider } from '@qovery/domains/service-logs/feature'
import { serviceLogsParamsSchema } from '@qovery/shared/router'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/service-logs'
)({
  component: RouteComponent,
  validateSearch: serviceLogsParamsSchema,
})

function ServiceLogs() {
  const { environmentId = '', organizationId = '', projectId = '' } = Route.useParams()
  const { data: environment } = useEnvironment({ environmentId, suspense: true })

  const [deploymentStages, setDeploymentStages] = useState<DeploymentStageWithServicesStatuses[]>()
  const [environmentStatus, setEnvironmentStatus] = useState<EnvironmentStatus>()

  const messageHandler = useCallback(
    (
      _: QueryClient,
      {
        stages,
        environment,
      }: {
        stages: DeploymentStageWithServicesStatuses[]
        environment: EnvironmentStatus
        pre_check_stage: EnvironmentStatusesWithStagesPreCheckStage
      }
    ) => {
      setDeploymentStages(stages)
      setEnvironmentStatus(environment)
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
    },
    enabled:
      Boolean(organizationId) && Boolean(environment?.cluster_id) && Boolean(projectId) && Boolean(environmentId),
    onMessage: messageHandler,
  })

  if (!environment) return null

  return (
    <PodLogsFeature
      environment={environment}
      deploymentStages={deploymentStages}
      environmentStatus={environmentStatus}
    />
  )
}

function RouteComponent() {
  return (
    <ServiceStageIdsProvider>
      <ServiceLogs />
    </ServiceStageIdsProvider>
  )
}
