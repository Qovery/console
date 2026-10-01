import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type ServiceEditWarning, ServiceEditWarningCodeEnum } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { mutations } from '@qovery/domains/services/data-access'
import { toast } from '@qovery/shared/ui'
import { queries } from '@qovery/state/util-queries'
import { useDeployService } from '../use-deploy-service/use-deploy-service'

const warningTitle = (code: ServiceEditWarning['code']) =>
  match(code)
    .with(
      ServiceEditWarningCodeEnum.WEBHOOK_PERMISSION_DENIED,
      ServiceEditWarningCodeEnum.WEBHOOK_SETUP_FAILED,
      () => 'Auto-deploy webhook not created'
    )
    .with(ServiceEditWarningCodeEnum.REPOSITORY_OWNER_CHANGED, () => 'Git account changed')
    // The API may add codes before this client is bumped
    .otherwise(() => 'Service updated with a warning')

export function useEditService({
  organizationId,
  projectId,
  environmentId,
  silently = false,
}: {
  organizationId: string
  projectId: string
  environmentId: string
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
      const warnings = 'warnings' in response ? response.warnings : undefined
      warnings?.forEach(({ code, message }) => toast('warning', warningTitle(code), message))
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
