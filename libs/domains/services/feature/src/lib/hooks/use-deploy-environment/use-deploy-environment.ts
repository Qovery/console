import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/environments/data-access'
import { queries } from '@qovery/state/util-queries'

// A `useDeployEnvironment` hook already exists in `@qovery/domains/environments/feature`,
// but importing it here would create a circular dependency
// (services-feature -> environments-feature -> services-feature).
// This local copy only depends on `environments/data-access`, keeping the graph acyclic.
export function useDeployEnvironment({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient()

  return useMutation(mutations.deployEnvironment, {
    onSuccess(_, { environmentId }) {
      queryClient.invalidateQueries({
        queryKey: queries.environments.listStatuses(projectId).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.environments.deploymentHistoryV2({ environmentId }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.services.deploymentHistory._def,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your environment is redeploying',
      },
      notifyOnError: true,
    },
  })
}
