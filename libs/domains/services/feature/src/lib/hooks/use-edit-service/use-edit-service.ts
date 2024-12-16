import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'
import { useDeployService } from '../use-deploy-service/use-deploy-service'

export function useEditService({
  environmentId,
  silently = false,
  logsLink,
}: {
  environmentId: string
  silently?: boolean
  logsLink?: string
}) {
  const queryClient = useQueryClient()
  const { mutate: deployService } = useDeployService({ environmentId, logsLink })

  return useMutation(mutations.editService, {
    onSuccess(response, { payload, serviceId }) {
      queryClient.invalidateQueries({
        queryKey: queries.services.list(response.environment.id).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.services.details({ serviceType: payload.serviceType, serviceId }).queryKey,
      })
    },
    ...(silently
      ? {}
      : {
          meta: {
            notifyOnSuccess(_: unknown, variables: unknown) {
              const { serviceId, payload } = variables as Parameters<typeof mutations.editService>[0]
              return {
                title: 'Service updated',
                description: 'You must update to apply the settings',
                callback() {
                  deployService({ serviceId, serviceType: payload.serviceType })
                },
                labelAction: 'Update',
              }
            },
            notifyOnError: true,
          },
        }),
  })
}

export default useEditService
