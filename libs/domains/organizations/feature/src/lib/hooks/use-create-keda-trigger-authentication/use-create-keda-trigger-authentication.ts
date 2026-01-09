import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCreateKedaTriggerAuthentication() {
  const queryClient = useQueryClient()

  return useMutation(mutations.createKedaTriggerAuthentication, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.kedaTriggerAuthentications({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'KEDA trigger authentication created',
      },
      notifyOnError: true,
    },
  })
}

export default useCreateKedaTriggerAuthentication
