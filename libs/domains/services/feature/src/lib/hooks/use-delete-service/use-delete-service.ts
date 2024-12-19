import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export function useDeleteService({ organizationId, environmentId }: { organizationId: string; environmentId: string }) {
  const queryClient = useQueryClient()

  return useMutation(mutations.deleteService, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.services.list(environmentId).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.services.listStatuses(environmentId).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.environments.deploymentHistoryV2({ environmentId }).queryKey,
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
        title: 'Your service is being deleted',
      },
      notifyOnError: true,
    },
  })
}

export default useDeleteService
