import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import type { AxiosError } from 'axios'
import { mutations } from '@qovery/domains/variables/data-access'
import { toastError } from '@qovery/shared/ui'
import { queries } from '@qovery/state/util-queries'

export function useCreateVariable() {
  const { buildLocation } = useRouter()
  const queryClient = useQueryClient()
  return useMutation(mutations.createVariable, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.variables.list._def,
      })
    },
    onError(
      error: AxiosError<{
        existing_variable: { organization_id: string; project_id: string; environment_id: string; service_id: string }
      }>
    ) {
      if (error.code === '409') {
        if (error.response?.data) {
          const {
            organization_id: orgId,
            project_id: projectId,
            environment_id: envId,
            service_id: serviceId,
          } = error.response.data.existing_variable
          const url = serviceId
            ? buildLocation({
                to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/variables',
                params: {
                  organizationId: orgId,
                  projectId,
                  environmentId: envId,
                  serviceId,
                },
              }).href
            : envId
              ? buildLocation({
                  to: '/organization/$organizationId/project/$projectId/environment/$environmentId/variables',
                  params: {
                    organizationId: orgId,
                    projectId,
                    environmentId: envId,
                  },
                }).href
              : buildLocation({
                  to: '/organization/$organizationId/project/$projectId/variables',
                  params: {
                    organizationId: orgId,
                    projectId,
                  },
                }).href
          toastError(
            error,
            'Conflict',
            error.message,
            () => window.open(url, '_blank'),
            'Go to the conflicting variable'
          )
        }
      } else {
        toastError(error)
      }
    },
    meta: {
      notifyOnError: false,
    },
  })
}

export default useCreateVariable
