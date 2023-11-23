import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCreateOrganization() {
  const queryClient = useQueryClient()

  return useMutation(mutations.createOrganization, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.list.queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your organization has been created',
      },
      notifyOnError: true,
    },
  })
}

export default useCreateOrganization
