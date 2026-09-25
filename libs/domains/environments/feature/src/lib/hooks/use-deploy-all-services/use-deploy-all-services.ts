import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type EnvironmentStatus } from 'qovery-typescript-axios'
import { mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'
import { useNavigateToEnvironmentPipeline } from '../use-navigate-to-environment-pipeline'

// XXX: Duplicate with the one in the Services domain
// Necessary to avoid circular dependencies
export function useDeployAllServices() {
  const queryClient = useQueryClient()
  const navigateToEnvironmentPipeline = useNavigateToEnvironmentPipeline()

  return useMutation(mutations.deployAllServices, {
    onSuccess(_, { environment, payload }) {
      queryClient.invalidateQueries({
        queryKey: queries.services.listStatuses(environment.id).queryKey,
      })
      // NOTE: This is to invalidate deployed git_commit_id cache
      for (const { application_id: serviceId } of payload.applications ?? []) {
        queryClient.invalidateQueries({
          queryKey: queries.services.details({ serviceId, serviceType: 'APPLICATION' }).queryKey,
        })
      }
      for (const { id: serviceId } of payload.containers ?? []) {
        queryClient.invalidateQueries({
          queryKey: queries.services.details({ serviceId, serviceType: 'CONTAINER' }).queryKey,
        })
      }
      for (const id of payload.databases ?? []) {
        queryClient.invalidateQueries({
          queryKey: queries.services.details({ serviceId: id, serviceType: 'DATABASE' }).queryKey,
        })
      }
      for (const { id: serviceId } of payload.helms ?? []) {
        if (serviceId) {
          queryClient.invalidateQueries({
            queryKey: queries.services.details({ serviceId, serviceType: 'HELM' }).queryKey,
          })
        }
      }
      for (const { id: serviceId } of payload.jobs ?? []) {
        if (serviceId) {
          queryClient.invalidateQueries({
            queryKey: queries.services.details({ serviceId, serviceType: 'JOB' }).queryKey,
          })
        }
      }
      for (const { id: serviceId } of payload.terraforms ?? []) {
        if (serviceId) {
          queryClient.invalidateQueries({
            queryKey: queries.services.details({ serviceId, serviceType: 'TERRAFORM' }).queryKey,
          })
        }
      }
    },
    meta: {
      notifyOnSuccess(data: unknown, variables: unknown) {
        const { last_deployment_id: deploymentId } = data as EnvironmentStatus
        const {
          environment: {
            id: environmentId,
            organization: { id: organizationId },
            project: { id: projectId },
          },
        } = variables as Parameters<typeof mutations.deployAllServices>[0]
        return {
          title: 'Your services are being deployed',
          labelAction: 'See pipeline',
          callback: () => navigateToEnvironmentPipeline({ organizationId, projectId, environmentId, deploymentId }),
        }
      },
      notifyOnError: true,
    },
  })
}

export default useDeployAllServices
