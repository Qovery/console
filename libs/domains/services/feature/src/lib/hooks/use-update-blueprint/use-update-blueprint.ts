import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export function useUpdateBlueprint({
  environmentId,
  serviceId,
  serviceType,
}: {
  environmentId: string
  serviceId: string
  serviceType: Parameters<typeof queries.services.details>[0]['serviceType']
}) {
  const queryClient = useQueryClient()

  return useMutation(mutations.updateBlueprint, {
    onSuccess(response, { blueprintId }) {
      queryClient.invalidateQueries({
        queryKey: queries.services.list(response.environment_id).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.services.details({ serviceId, serviceType }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.services.blueprintUpdate({ blueprintId }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.services.listStatuses(environmentId).queryKey,
      })
    },
    meta: {
      notifyOnError: true,
    },
  })
}

export default useUpdateBlueprint
