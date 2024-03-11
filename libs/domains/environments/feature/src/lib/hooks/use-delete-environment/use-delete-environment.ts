import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { mutations } from '@qovery/domains/environments/data-access'
import { queries } from '@qovery/state/util-queries'

export function useDeleteEnvironment({ projectId, logsLink }: { projectId: string; logsLink?: string }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation(mutations.deleteEnvironment, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.environments.listStatuses(projectId).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.environments.list({ projectId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your environment is being deleted',
        ...(logsLink
          ? {
              labelAction: 'See Deployment Logs',
              callback: () => navigate(logsLink),
            }
          : {}),
      },
      notifyOnError: true,
    },
  })
}

export default useDeleteEnvironment
