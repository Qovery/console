import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'
import { useRedeployService } from '../use-redeploy-service/use-redeploy-service'

export function useCreateCustomDomain({ environmentId }: { environmentId: string }) {
  const queryClient = useQueryClient()
  const { mutate: redeployService } = useRedeployService({ environmentId })

  return useMutation(mutations.createCustomDomain, {
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
        const { serviceId, serviceType } = variables as Parameters<typeof mutations.createCustomDomain>[0]
        return {
          title: 'Your domain has been created',
          description: 'Service must be redeployed to apply the settings update',
          callback() {
            redeployService({ serviceId, serviceType })
          },
          labelAction: 'Update',
        }
      },
      notifyOnError: true,
    },
  })
}

export default useCreateCustomDomain
