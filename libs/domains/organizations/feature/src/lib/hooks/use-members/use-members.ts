import { useQuery } from '@tanstack/react-query'
import { toastError } from '@qovery/shared/ui'
import { type SerializedError } from '@qovery/shared/utils'
import { queries } from '@qovery/state/util-queries'

export interface UseMembersProps {
  organizationId: string
}

export function useMembers({ organizationId }: UseMembersProps) {
  return useQuery({
    ...queries.organizations.members({ organizationId }),
    onError: (error: SerializedError) => {
      if (error?.response?.status === 403) {
        toastError(error, 'Permission denied', 'You do not have permission to view organization members')
      }
    },
  })
}

export default useMembers
