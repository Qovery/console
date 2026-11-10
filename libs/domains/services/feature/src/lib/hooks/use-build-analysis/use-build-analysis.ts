import { useQuery } from '@tanstack/react-query'
import { type BuildAnalysisServiceType } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseBuildAnalysisProps {
  serviceId: string
  serviceType: BuildAnalysisServiceType
  // Deployment being viewed, which may have become the latest build since the state was last read
  executionId: string
  enabled?: boolean
}

/**
 * Latest build of the service that can be analysed, and its latest analysis.
 */
export function useBuildAnalysis({ serviceId, serviceType, executionId, enabled = true }: UseBuildAnalysisProps) {
  return useQuery({
    ...queries.services.buildAnalysis({ serviceId, serviceType, executionId }),
    enabled,
  })
}

export default useBuildAnalysis
