import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseCreateContainerRegistryProps {
  organizationId: string
}

export function useCreateContainerRegistry({ organizationId }: UseCreateContainerRegistryProps) {
  const queryClient = useQueryClient()

  return useMutation(mutations.createContainerRegistry, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.containerRegistries({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your container registry has been created',
      },
      notifyOnError: true,
    },
  })
}

export default useCreateContainerRegistry
