import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type AnyService, mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export function useDeployBlueprint({
  environmentId,
  serviceId,
  serviceType,
}: {
  environmentId: string
  serviceId: string
  serviceType: AnyService['serviceType']
}) {
  const queryClient = useQueryClient()

  return useMutation(mutations.deployBlueprint, {
    onSuccess(_, { blueprintId }) {
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

export default useDeployBlueprint
