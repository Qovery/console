import { useQuery } from '@tanstack/react-query'
import { type BuildAnalysisState } from 'qovery-typescript-axios'
import { type BuildAnalysisServiceType } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseBuildAnalysisProps {
  serviceId: string
  serviceType: BuildAnalysisServiceType
  // Deployment being viewed, which may have become the latest build since the state was last read
  executionId: string
  enabled?: boolean
}

const RUNNING_ANALYSIS_REFETCH_INTERVAL_MS = 10_000

/**
 * The websocket follows a running analysis, but closes early when its progress is unavailable or times out, and
 * doesn't reconnect: the state is read again until the analysis ends, so the button never stays on it.
 */
export function getBuildAnalysisRefetchInterval(state?: BuildAnalysisState) {
  const status = state?.analysis?.status
  const isRunning = status === 'PENDING' || status === 'COLLECTING' || status === 'ANALYSING'

  return isRunning ? RUNNING_ANALYSIS_REFETCH_INTERVAL_MS : false
}

/**
 * Latest build of the service that can be analysed, and its latest analysis.
 */
export function useBuildAnalysis({ serviceId, serviceType, executionId, enabled = true }: UseBuildAnalysisProps) {
  return useQuery({
    ...queries.services.buildAnalysis({ serviceId, serviceType, executionId }),
    refetchInterval: getBuildAnalysisRefetchInterval,
    enabled,
  })
}

export default useBuildAnalysis
