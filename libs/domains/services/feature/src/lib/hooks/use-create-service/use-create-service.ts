import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCreateService({ organizationId }: { organizationId: string }) {
  const queryClient = useQueryClient()

  return useMutation(mutations.createService, {
    onSuccess(response) {
      queryClient.invalidateQueries({
        queryKey: queries.services.list(response.environment.id).queryKey,
      })

      // gitTokens requests
      queryClient.invalidateQueries({
        queryKey: queries.organizations.gitTokens({ organizationId }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.organizations.gitTokenAssociatedServices._def,
      })

      // containerRegistries requests
      queryClient.invalidateQueries({
        queryKey: queries.organizations.containerRegistries({ organizationId }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.organizations.containerRegistryAssociatedServices._def,
      })

      // helmRepositories requests
      queryClient.invalidateQueries({
        queryKey: queries.organizations.helmRepositories({ organizationId }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.organizations.helmRepositoryAssociatedServices._def,
      })

      // labelsGroups requests
      queryClient.invalidateQueries({
        queryKey: queries.organizations.labelsGroups({ organizationId }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.organizations.labelsGroupAssociatedItems._def,
      })

      // annotationsGroups requests
      queryClient.invalidateQueries({
        queryKey: queries.organizations.annotationsGroups({ organizationId }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.organizations.annotationsGroupAssociatedItems._def,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: `Your service has been created`,
      },
      notifyOnError: true,
    },
  })
}

export default useCreateService
