import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseEditContainerRegistryProps {
  organizationId: string
}

export function useEditContainerRegistry({ organizationId }: UseEditContainerRegistryProps) {
  const queryClient = useQueryClient()

  return useMutation(mutations.editContainerRegistry, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.containerRegistries({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your container registry is being edited',
      },
      notifyOnError: true,
    },
  })
}

export default useEditContainerRegistry
