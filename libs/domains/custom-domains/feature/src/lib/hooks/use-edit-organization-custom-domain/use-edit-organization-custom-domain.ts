import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type CustomDomainRequest } from 'qovery-typescript-axios'
import { mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

type CustomDomainServiceType = Parameters<typeof mutations.editCustomDomain>[0]['serviceType']

export interface OrganizationCustomDomainTarget {
  serviceId: string
  serviceType: CustomDomainServiceType
  customDomainId: string
}

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

const deployServices = (targets: OrganizationCustomDomainTarget[]) =>
  Promise.all(
    [...new Map(targets.map((target) => [target.serviceId, target])).values()].map(({ serviceId, serviceType }) =>
      mutations.deployService({ serviceId, serviceType })
    )
  )

// An organization domain is stored once per service it serves: edit or delete every copy, then optionally redeploy.
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
      await Promise.all([
        ...variables.targets.map((target) => mutations.editCustomDomain({ ...target, payload: variables.payload })),
        ...variables.removedTargets.map((target) => mutations.deleteCustomDomain(target)),
      ])
      if (variables.redeploy) await deployServices(getAffectedTargets(variables))
    },
    {
      onSuccess(_, variables) {
        const targets = getAffectedTargets(variables)
        queryClient.invalidateQueries({ queryKey: queries.customDomains.organizationList._def })
        targets.forEach(({ serviceId, serviceType }) => {
          queryClient.invalidateQueries({
            queryKey: queries.services.customDomains({ serviceId, serviceType }).queryKey,
          })
          queryClient.invalidateQueries({
            queryKey: queries.services.listLinks({ serviceId, serviceType }).queryKey,
          })
        })
        if (variables.redeploy) invalidateServices(targets)
      },
      meta: {
        notifyOnSuccess(_: unknown, variables: unknown) {
          const { redeploy } = variables as EditOrganizationCustomDomainVariables
          const targets = getAffectedTargets(variables as EditOrganizationCustomDomainVariables)
          const serviceCount = new Set(targets.map(({ serviceId }) => serviceId)).size
          const services = `${serviceCount} service${serviceCount > 1 ? 's' : ''}`
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
        notifyOnError: true,
      },
    }
  )
}

export default useEditOrganizationCustomDomain
