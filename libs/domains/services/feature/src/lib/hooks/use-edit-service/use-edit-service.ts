import { useMutation, useQueryClient } from '@tanstack/react-query'
import { TerraformDeployRequestActionEnum } from 'qovery-typescript-axios'
import { mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'
import { useDeployService } from '../use-deploy-service/use-deploy-service'

export function useEditService({
  organizationId,
  projectId,
  environmentId,
  planTerraformChanges = false,
  silently = false,
}: {
  organizationId: string
  projectId: string
  environmentId: string
  planTerraformChanges?: boolean
  silently?: boolean
}) {
  const queryClient = useQueryClient()
  const { mutate: deployService } = useDeployService({ organizationId, projectId, environmentId })

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
              if (payload.serviceType === 'AGENTIC_WORKFLOW') {
                return {
                  title: 'Service updated',
                  description: 'Your agent task settings were saved',
                }
              }
              const shouldPlanTerraformChanges = planTerraformChanges && payload.serviceType === 'TERRAFORM'

              return {
                title: 'Service updated',
                description: shouldPlanTerraformChanges
                  ? 'Run a plan to preview these changes before applying them'
                  : 'You must update to apply the settings',
                callback() {
                  if (shouldPlanTerraformChanges) {
                    deployService({
                      serviceId,
                      serviceType: payload.serviceType,
                      request: { action: TerraformDeployRequestActionEnum.PLAN },
                    })
                  } else {
                    deployService({ serviceId, serviceType: payload.serviceType })
                  }
                },
                labelAction: shouldPlanTerraformChanges ? 'Plan' : 'Update',
              }
            },
            notifyOnError: true,
          },
        }),
  })
}

export default useEditService
