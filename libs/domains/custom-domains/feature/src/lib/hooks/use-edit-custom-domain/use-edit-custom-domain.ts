import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'
import { useDeployService } from '@qovery/domains/services/feature'
import { queries } from '@qovery/state/util-queries'

export function useEditCustomDomain({ environmentId, logsLink }: { environmentId: string; logsLink?: string }) {
  const queryClient = useQueryClient()
  const { mutate: deployService } = useDeployService({ environmentId, logsLink })

  return useMutation(mutations.editCustomDomain, {
    onSuccess(_, { serviceType, serviceId }) {
      queryClient.invalidateQueries({
        queryKey: queries.services.customDomains({ serviceId, serviceType }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.services.listLinks({ serviceId, serviceType }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess(_: unknown, variables: unknown) {
        const { serviceId, serviceType } = variables as Parameters<typeof mutations.editCustomDomain>[0]
        return {
          title: 'Your domain has been updated',
          description: 'Service must be redeployed to apply the settings update',
          callback() {
            deployService({ serviceId, serviceType })
          },
          labelAction: 'Update',
        }
      },
      notifyOnError: true,
    },
  })
}

export default useEditCustomDomain
