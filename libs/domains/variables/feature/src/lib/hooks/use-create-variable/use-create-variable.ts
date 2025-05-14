import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { mutations } from '@qovery/domains/variables/data-access'
import {
  APPLICATION_URL,
  APPLICATION_VARIABLES_URL,
  ENVIRONMENTS_URL,
  ENVIRONMENTS_VARIABLES_URL,
  SERVICES_URL,
  SERVICES_VARIABLES_URL,
} from '@qovery/shared/routes'
import { toastError } from '@qovery/shared/ui'
import { queries } from '@qovery/state/util-queries'

export function useCreateVariable() {
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
      }>,
      variables,
      context
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
            ? `${APPLICATION_URL(orgId, projectId, envId, serviceId)}${APPLICATION_VARIABLES_URL}`
            : envId
              ? `${SERVICES_URL(orgId, projectId, envId)}${SERVICES_VARIABLES_URL}`
              : `${ENVIRONMENTS_URL(orgId, projectId)}${ENVIRONMENTS_VARIABLES_URL}`
          toastError(error, 'Conflict', error.message, undefined, undefined, 'Go to the conflicting variable', url)
        }
      }
    },
    meta: {
      notifyOnError: false,
    },
  })
}

export default useCreateVariable
