import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useUpdateKedaTriggerAuthentication() {
  const queryClient = useQueryClient()

  return useMutation(mutations.updateKedaTriggerAuthentication, {
    onSuccess(_, { organizationId, triggerAuthenticationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.kedaTriggerAuthentications({ organizationId }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.organizations.kedaTriggerAuthentication({ organizationId, triggerAuthenticationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'KEDA trigger authentication updated',
      },
      notifyOnError: true,
    },
  })
}

export default useUpdateKedaTriggerAuthentication
