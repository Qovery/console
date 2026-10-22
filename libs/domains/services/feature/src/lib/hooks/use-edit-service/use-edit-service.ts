import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type ServiceEditWarning, ServiceEditWarningCodeEnum } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { mutations } from '@qovery/domains/services/data-access'
import { toast } from '@qovery/shared/ui'
import { queries } from '@qovery/state/util-queries'
import { useDeployService } from '../use-deploy-service/use-deploy-service'

const warningToast = ({ code, message }: ServiceEditWarning) =>
  match(code)
    .with(ServiceEditWarningCodeEnum.WEBHOOK_PERMISSION_DENIED, () => ({
      title: 'Auto-deploy webhook not created',
      description:
        'The git account used by this service needs admin rights on the repository to create the webhook. Ask a repository admin to save this change, or use a git token with admin rights. Until then, pushes will not trigger deployments.',
    }))
    .with(ServiceEditWarningCodeEnum.WEBHOOK_SETUP_FAILED, () => ({
      title: 'Auto-deploy webhook not created',
      description:
        'Qovery could not create the webhook on the repository, so pushes will not trigger deployments. Check the webhook status in the auto-deploy settings.',
    }))
    .with(ServiceEditWarningCodeEnum.REPOSITORY_OWNER_CHANGED, () => ({
      title: 'Git account changed',
      description:
        'The previous git account can no longer access the repository, so your git account is now used for this service.',
    }))
    // The API may add codes before this client is bumped: show its own message
    .otherwise(() => ({ title: 'Service updated with a warning', description: message }))

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
      warnings?.map(warningToast).forEach(({ title, description }) => toast('warning', title, description))
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
