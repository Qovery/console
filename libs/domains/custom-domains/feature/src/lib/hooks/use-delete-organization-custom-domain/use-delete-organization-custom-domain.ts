import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pluralize } from '@qovery/shared/util-js'
import {
  type OrganizationCustomDomainTarget,
  deleteOrganizationCustomDomainCopy,
  invalidateOrganizationCustomDomainTargets,
  settleOrganizationCustomDomainOperations,
} from '../../utils/organization-custom-domain-operations'

export interface DeleteOrganizationCustomDomainVariables {
  targets: OrganizationCustomDomainTarget[]
}

// Delete every copy of the domain. Copies already deleted by an earlier attempt count as deleted, so retrying is safe.
export function useDeleteOrganizationCustomDomain() {
  const queryClient = useQueryClient()

  return useMutation(
    ({ targets }: DeleteOrganizationCustomDomainVariables) =>
      settleOrganizationCustomDomainOperations(
        targets.map((target) => () => deleteOrganizationCustomDomainCopy(target)),
        (failed, total) =>
          `${failed} of ${total} service ${pluralize(total, 'configuration')} could not be deleted. Confirm again to retry.`
      ),
    {
      // Refresh on failure too: some copies may be gone.
      onSettled(_, __, variables) {
        if (variables) invalidateOrganizationCustomDomainTargets(queryClient, variables.targets)
      },
      meta: {
        notifyOnSuccess: { title: 'Your domain is being deleted' },
        notifyOnError: { title: 'Your domain was not fully deleted' },
      },
    }
  )
}
