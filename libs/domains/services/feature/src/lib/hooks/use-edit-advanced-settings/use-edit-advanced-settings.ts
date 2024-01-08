import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'
import { useDeployService } from '../use-deploy-service/use-deploy-service'

export function useEditAdvancedSettings({ environmentId }: { environmentId: string }) {
  const queryClient = useQueryClient()
  const { mutate: deployService } = useDeployService({ environmentId })

  return useMutation(mutations.editAdvancedSettings, {
    onSuccess(_, { serviceId, payload: { serviceType } }) {
      queryClient.invalidateQueries({
        queryKey: queries.services.advancedSettings({ serviceId, serviceType }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess(_: unknown, variables: unknown) {
        const {
          serviceId,
          payload: { serviceType },
        } = variables as Parameters<typeof mutations.editAdvancedSettings>[0]
        return {
          title: 'Service updated',
          description: 'You must update to apply the settings',
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

export default useEditAdvancedSettings
