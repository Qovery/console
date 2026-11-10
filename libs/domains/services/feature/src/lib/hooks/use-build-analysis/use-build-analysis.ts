import { useQuery } from '@tanstack/react-query'
import { type BuildAnalysisServiceType } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseBuildAnalysisProps {
  serviceId: string
  serviceType: BuildAnalysisServiceType
  enabled?: boolean
}

/**
 * Latest build of the service that can be analysed, and its latest analysis.
 */
export function useBuildAnalysis({ serviceId, serviceType, enabled = true }: UseBuildAnalysisProps) {
  return useQuery({
    ...queries.services.buildAnalysis({ serviceId, serviceType }),
    enabled,
  })
}

export default useBuildAnalysis
