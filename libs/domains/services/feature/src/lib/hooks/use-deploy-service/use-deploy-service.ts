import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { mutations } from '@qovery/domains/services/data-access'
import { toast } from '@qovery/shared/ui'
import { queries } from '@qovery/state/util-queries'

export function useDeployService({
  organizationId,
  projectId,
  environmentId,
}: {
  organizationId: string
  projectId: string
  environmentId: string
}) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation(mutations.deployService, {
    onSuccess(data, { serviceId, serviceType }) {
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

      toast(
        'success',
        'Your service is queuing',
        undefined,
        () =>
          navigate({
            to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/deployments',
            params: {
              organizationId,
              projectId,
              environmentId,
              serviceId: data.id,
            },
          }),
        'See queue'
      )
    },
    meta: {
      notifyOnError: true,
    },
  })
}

export default useDeployService
