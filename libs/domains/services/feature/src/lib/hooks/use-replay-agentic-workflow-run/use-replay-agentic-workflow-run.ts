import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'
import { toast } from '@qovery/shared/ui'
import { queries } from '@qovery/state/util-queries'

export function useReplayAgenticWorkflowRun({ serviceId }: { serviceId: string }) {
  const queryClient = useQueryClient()

  return useMutation(mutations.replayAgenticWorkflowRun, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: [...queries.services.agenticWorkflowRunHistory._def, serviceId],
      })

      toast('success', 'Run replayed', 'The original payload was sent to the agent task webhook.')
    },
    onError(error) {
      toast('error', 'Replay failed', error instanceof Error ? error.message : undefined)
    },
  })
}

export default useReplayAgenticWorkflowRun
