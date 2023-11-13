import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseEditCustomRoleProps {
  organizationId: string
  customRoleId: string
}

export function useEditCustomRole({ organizationId, customRoleId }: UseEditCustomRoleProps) {
  const queryClient = useQueryClient()

  return useMutation(mutations.editCustomRole, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.customRole({ organizationId, customRoleId }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.organizations.availableRoles({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your custom role is edited',
      },
      notifyOnError: true,
    },
  })
}

export default useEditCustomRole
