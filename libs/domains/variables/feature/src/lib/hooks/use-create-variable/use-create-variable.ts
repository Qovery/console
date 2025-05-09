import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { mutations } from '@qovery/domains/variables/data-access'
import { SERVICES_URL, SERVICES_VARIABLES_URL } from '@qovery/shared/routes'
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
      error: AxiosError<{ existing_variable: { organization_id: string; project_id: string; environment_id: string } }>,
      variables,
      context
    ) {
      if (error.code === '409') {
        if (error.response?.data) {
          const {
            organization_id: orgId,
            project_id: projectId,
            environment_id: envId,
          } = error.response.data.existing_variable
          toastError(
            error,
            'Conflict',
            error.message,
            undefined,
            undefined,
            'Go to the conflicting variable',
            `${SERVICES_URL(orgId, projectId, envId)}${SERVICES_VARIABLES_URL}`
          )
        }
      }
    },
    meta: {
      notifyOnError: false,
    },
  })
}

export default useCreateVariable
