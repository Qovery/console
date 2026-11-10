import { type QueryClient } from '@tanstack/react-query'
import { type BuildAnalysisStatus } from 'qovery-typescript-axios'
import { useState } from 'react'
import { type BuildAnalysisServiceType } from '@qovery/domains/services/data-access'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { queries, useReactQueryWsSubscription } from '@qovery/state/util-queries'

// One event of the `/build/analysis` websocket route
export interface BuildAnalysisEvent {
  status: BuildAnalysisStatus
  // Human-readable label of the current step
  step: string
  // Details about the event, e.g. why the analysis failed
  message?: string | null
  // True on the last event of the analysis, DONE or FAILED
  terminal: boolean
}

export interface UseBuildAnalysisProgressProps {
  organizationId: string
  clusterId?: string
  projectId: string
  environmentId: string
  serviceId: string
  serviceType: BuildAnalysisServiceType
  enabled?: boolean
}

/**
 * Follows a running build analysis, and reads the analysis again once it ends.
 */
export function useBuildAnalysisProgress({
  organizationId,
  clusterId,
  projectId,
  environmentId,
  serviceId,
  serviceType,
  enabled = true,
}: UseBuildAnalysisProgressProps) {
  const [lastEvent, setLastEvent] = useState<BuildAnalysisEvent>()

  // Once the analysis ended, or the route closed early because its progress is unavailable or timed out.
  // The state belongs to the service, so it's read again for each of its deployment pages.
  const refetchBuildAnalysis = (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: [...queries.services.buildAnalysis._def, serviceId, serviceType] })

  useReactQueryWsSubscription({
    url: QOVERY_WS + '/build/analysis',
    urlSearchParams: {
      organization: organizationId,
      cluster: clusterId,
      project: projectId,
      environment: environmentId,
      service: serviceId,
    },
    enabled: enabled && Boolean(organizationId && clusterId && projectId && environmentId && serviceId),
    onMessage: (queryClient: QueryClient, event: BuildAnalysisEvent) => {
      setLastEvent(event)
      if (event.terminal) refetchBuildAnalysis(queryClient)
    },
    onClose: refetchBuildAnalysis,
  })

  return enabled ? lastEvent : undefined
}

export default useBuildAnalysisProgress
