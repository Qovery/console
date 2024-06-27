import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCleanFailedJobs() {
  const queryClient = useQueryClient()

  return useMutation(mutations.cleanFailedJobs, {
    onSuccess(_, { environmentId, payload }) {
      queryClient.invalidateQueries({
        queryKey: queries.services.listStatuses(environmentId).queryKey,
      })
      for (const jobId in payload.job_ids) {
        queryClient.invalidateQueries({
          queryKey: queries.services.runningStatus(environmentId, jobId).queryKey,
        })
      }
    },
  })
}

export default useCleanFailedJobs
