import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type BuildAnalysisState } from 'qovery-typescript-axios'
import { mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export function useStartBuildAnalysis() {
  const queryClient = useQueryClient()

  return useMutation(mutations.startBuildAnalysis, {
    async onSuccess(analysis, { serviceId, serviceType, executionId }) {
      const { queryKey } = queries.services.buildAnalysis({ serviceId, serviceType, executionId })
      // A read sent before the start would answer with the state from before and replace the started analysis
      await queryClient.cancelQueries({ queryKey })
      // The started analysis replaces the previous one right away, so its progress can be followed
      queryClient.setQueryData<BuildAnalysisState>(queryKey, (state) => ({
        latest_build_execution_id: state?.latest_build_execution_id ?? executionId,
        analysis,
      }))
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
