import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { mutations } from '@qovery/domains/services/data-access'
import { toast } from '@qovery/shared/ui'
import { queries } from '@qovery/state/util-queries'

export function useUninstallService({
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

  return useMutation(mutations.uninstallService, {
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

      toast(
        'SUCCESS',
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
        undefined,
        'See deployment queue'
      )
    },
    meta: {
      notifyOnError: true,
    },
  })
}

export default useUninstallService
