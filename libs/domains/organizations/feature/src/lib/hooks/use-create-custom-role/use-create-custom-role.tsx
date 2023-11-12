import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseCreateCustomRoleProps {
  organizationId: string
}

export function useCreateCustomRole({ organizationId }: UseCreateCustomRoleProps) {
  const queryClient = useQueryClient()

  return useMutation(mutations.createCustomRole, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.availableRoles({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your custom role is created',
      },
      notifyOnError: true,
    },
  })
}

export default useCreateCustomRole
