import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export function useDeployService({ environmentId, logsLink }: { environmentId: string; logsLink?: string }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation(mutations.deployService, {
    onSuccess(_, { serviceId, serviceType }) {
      queryClient.invalidateQueries({
        queryKey: queries.services.listStatuses(environmentId).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.services.status({ id: serviceId, serviceType }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.services.deploymentHistory({ serviceId, serviceType }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.environments.deploymentHistoryV2({ environmentId }).queryKey,
      })
      // NOTE: We need to invalidate current commit from service and from the commit list from the repository
      // This is to invalidate deployed git_commit_id cache
      queryClient.invalidateQueries({
        queryKey: queries.services.details({ serviceId, serviceType }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.services.list(environmentId).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your service is deploying',
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

export default useDeployService
