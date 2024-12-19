import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export function useRestartService({ environmentId, logsLink }: { environmentId: string; logsLink?: string }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation(mutations.restartService, {
    onSuccess(_, { serviceId, serviceType }) {
      queryClient.invalidateQueries({
        queryKey: queries.services.listStatuses(environmentId).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.services.status({ id: serviceId, serviceType }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.environments.deploymentHistoryV2({ environmentId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your service is restarting',
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

export default useRestartService
