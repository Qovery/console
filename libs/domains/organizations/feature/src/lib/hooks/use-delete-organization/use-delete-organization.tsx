import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useDeleteOrganization({ organizationId }: { organizationId: string }) {
  const queryClient = useQueryClient()

  return useMutation(mutations.deleteOrganization, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.list().queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.organizations.details({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your organization is deleted',
      },
      notifyOnError: true,
    },
  })
}

export default useDeleteOrganization
