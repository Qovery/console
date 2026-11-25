import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type CustomDomainRequest } from 'qovery-typescript-axios'
import { mutations } from '@qovery/domains/services/data-access'
import { pluralize } from '@qovery/shared/util-js'
import { queries } from '@qovery/state/util-queries'
import {
  type OrganizationCustomDomainTarget,
  deleteOrganizationCustomDomainCopy,
  invalidateOrganizationCustomDomainTargets,
  settleOrganizationCustomDomainOperations,
} from '../../utils/organization-custom-domain-operations'

export type { OrganizationCustomDomainTarget }

export interface EditOrganizationCustomDomainVariables {
  // Service configurations that keep serving the domain.
  targets: OrganizationCustomDomainTarget[]
  // Service configurations that stop serving the domain.
  removedTargets: OrganizationCustomDomainTarget[]
  payload: CustomDomainRequest
  redeploy: boolean
}

const getAffectedTargets = ({ targets, removedTargets }: EditOrganizationCustomDomainVariables) => [
  ...targets,
  ...removedTargets,
]

const deployServices = (targets: OrganizationCustomDomainTarget[]) => {
  const services = [...new Map(targets.map((target) => [target.serviceId, target])).values()]
  return settleOrganizationCustomDomainOperations(
    services.map(
      ({ serviceId, serviceType }) =>
        () =>
          mutations.deployService({ serviceId, serviceType })
    ),
    (failed, total) =>
      `The domain was saved, but ${failed} of ${total} ${pluralize(total, 'service')} could not be redeployed.`
  )
}

// Edit or delete every copy of the domain, then optionally redeploy.
// Edits replace the whole copy and deleting a missing copy succeeds, so saving again after a partial failure is safe.
export function useEditOrganizationCustomDomain({ environmentId }: { environmentId: string }) {
  const queryClient = useQueryClient()

  const invalidateServices = (targets: OrganizationCustomDomainTarget[]) => {
    queryClient.invalidateQueries({ queryKey: queries.services.listStatuses(environmentId).queryKey })
    targets.forEach(({ serviceId, serviceType }) =>
      queryClient.invalidateQueries({ queryKey: queries.services.status({ id: serviceId, serviceType }).queryKey })
    )
  }

  return useMutation(
    async (variables: EditOrganizationCustomDomainVariables) => {
      await settleOrganizationCustomDomainOperations(
        [
          ...variables.targets.map(
            (target) => () => mutations.editCustomDomain({ ...target, payload: variables.payload })
          ),
          ...variables.removedTargets.map((target) => () => deleteOrganizationCustomDomainCopy(target)),
        ],
        (failed, total) =>
          `${failed} of ${total} service ${pluralize(total, 'configuration')} could not be updated. Save again to retry.`
      )
      if (variables.redeploy) await deployServices(getAffectedTargets(variables))
    },
    {
      // Refresh on failure too: some copies may have changed.
      onSettled(_, __, variables) {
        if (!variables) return
        const targets = getAffectedTargets(variables)
        invalidateOrganizationCustomDomainTargets(queryClient, targets)
        if (variables.redeploy) invalidateServices(targets)
      },
      meta: {
        notifyOnSuccess(_: unknown, variables: unknown) {
          const { redeploy } = variables as EditOrganizationCustomDomainVariables
          const targets = getAffectedTargets(variables as EditOrganizationCustomDomainVariables)
          const serviceCount = new Set(targets.map(({ serviceId }) => serviceId)).size
          const services = `${serviceCount} ${pluralize(serviceCount, 'service')}`
          if (redeploy) {
            return { title: 'Your domain has been updated', description: `Redeploying ${services}.` }
          }
          return {
            title: 'Your domain has been updated',
            description: `Redeploy ${services} to apply the change.`,
            labelAction: 'Redeploy',
            callback() {
              deployServices(targets).then(() => invalidateServices(targets))
            },
          }
        },
        notifyOnError: { title: 'Your domain was not fully updated' },
      },
    }
  )
}

export default useEditOrganizationCustomDomain
