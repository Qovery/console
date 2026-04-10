import { type QueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type EnvironmentStatusesWithStagesPreCheckStage } from 'qovery-typescript-axios'
import { useCallback, useState } from 'react'
import { ListPreCheckLogs } from '@qovery/domains/environment-logs/feature'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/deployment/$deploymentId/pre-check-logs'
)({
  component: RouteComponent,
})

function PreCheckLogs() {
  const { environmentId, organizationId, projectId, deploymentId } = Route.useParams()
  const { data: environment } = useEnvironment({ environmentId, suspense: true })
  const [preCheckStage, setPreCheckStage] = useState<EnvironmentStatusesWithStagesPreCheckStage>()

  const messageHandler = useCallback(
    (_: QueryClient, { pre_check_stage }: { pre_check_stage: EnvironmentStatusesWithStagesPreCheckStage }) => {
      setPreCheckStage(pre_check_stage)
    },
    [setPreCheckStage]
  )
  // XXX: If we don't have a version, it works like WS otherwise, it works like a REST API
  useReactQueryWsSubscription({
    url: QOVERY_WS + '/deployment/status',
    urlSearchParams: {
      organization: organizationId,
      cluster: environment?.cluster_id,
      project: projectId,
      environment: environmentId,
      version: deploymentId,
    },
    enabled:
      Boolean(organizationId) && Boolean(environment?.cluster_id) && Boolean(projectId) && Boolean(environmentId),
    onMessage: messageHandler,
  })

  if (!environment) return null

  return <ListPreCheckLogs environment={environment} preCheckStage={preCheckStage} />
}

function RouteComponent() {
  return <PreCheckLogs />
}
