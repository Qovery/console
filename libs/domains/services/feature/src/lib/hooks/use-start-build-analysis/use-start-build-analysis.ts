import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type BuildAnalysisState } from 'qovery-typescript-axios'
import { mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export function useStartBuildAnalysis() {
  const queryClient = useQueryClient()

  return useMutation(mutations.startBuildAnalysis, {
    onSuccess(analysis, { serviceId, serviceType, executionId }) {
      // The started analysis replaces the previous one right away, so its progress can be followed
      queryClient.setQueryData<BuildAnalysisState>(
        queries.services.buildAnalysis({ serviceId, serviceType, executionId }).queryKey,
        (state) => ({ latest_build_execution_id: state?.latest_build_execution_id ?? executionId, analysis })
      )
    },
    onError(_, { serviceId, serviceType }) {
      // A conflict means the build is no longer the latest, or an analysis already runs: read the current state,
      // from any deployment page of the service
      queryClient.invalidateQueries({ queryKey: [...queries.services.buildAnalysis._def, serviceId, serviceType] })
    },
    meta: {
      notifyOnError: true,
    },
  })
}

export default useStartBuildAnalysis
