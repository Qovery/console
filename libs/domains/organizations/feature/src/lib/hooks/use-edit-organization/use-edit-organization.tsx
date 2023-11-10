import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseEditOrganizationProps {
  organizationId: string
}

export function useEditOrganization({ organizationId }: UseEditOrganizationProps) {
  const queryClient = useQueryClient()

  return useMutation(mutations.editOrganization, {
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
        title: 'Your organization has been edited',
      },
      notifyOnError: true,
    },
  })
}

export default useEditOrganization
