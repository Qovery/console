import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import type { AxiosError } from 'axios'
import { type VariableRequest, type VariableResponse } from 'qovery-typescript-axios'
import { mutations } from '@qovery/domains/variables/data-access'
import { canOverrideConflictingVariable } from '@qovery/domains/variables/util'
import { toastError } from '@qovery/shared/ui'
import { isHttpStatus } from '@qovery/shared/utils'
import { queries } from '@qovery/state/util-queries'

// Body of a 409 on POST /variable. Location ids are always sent; the other VariableResponse fields
// (variable_type, is_secret, value, mount_path...) may be missing on older API versions.
export type ConflictingVariableResponse = Pick<VariableResponse, 'id' | 'key' | 'scope'> &
  Partial<Omit<VariableResponse, 'id' | 'key' | 'scope'>> & {
    organization_id: string
    project_id: string
    environment_id?: string | null
    service_id?: string | null
  }

export type UseCreateVariableProps = {
  // Called when the user picks "Create an override" on a conflict with an overridable higher-scope variable.
  // Without it, a conflict only offers a link to the existing variable.
  onCreateOverride?: (params: { parentVariable: VariableResponse; variableRequest: VariableRequest }) => void
}

export function useCreateVariable({ onCreateOverride }: UseCreateVariableProps = {}) {
  const { buildLocation } = useRouter()
  const queryClient = useQueryClient()
  return useMutation(mutations.createVariable, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.variables.list._def,
      })
    },
    onError(error: AxiosError<{ existing_variable?: ConflictingVariableResponse }>, { variableRequest }) {
      if (!isHttpStatus(error, 409)) {
        toastError(error)
        return
      }

      const existingVariable = error.response?.data?.existing_variable
      if (!existingVariable) {
        toastError(error, 'Conflict', error.message)
        return
      }

      const { variable_type, is_secret } = existingVariable
      if (
        onCreateOverride &&
        variable_type !== undefined &&
        is_secret !== undefined &&
        canOverrideConflictingVariable(existingVariable, variableRequest)
      ) {
        const parentVariable: VariableResponse = {
          created_at: '',
          value: null,
          ...existingVariable,
          variable_type,
          is_secret,
        }
        toastError(
          error,
          'Conflict',
          error.message,
          () => onCreateOverride({ parentVariable, variableRequest }),
          'Create an override'
        )
        return
      }

      const {
        organization_id: orgId,
        project_id: projectId,
        environment_id: envId,
        service_id: serviceId,
      } = existingVariable
      const url =
        serviceId && envId
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
      toastError(error, 'Conflict', error.message, () => window.open(url, '_blank'), 'Go to the conflicting variable')
    },
    meta: {
      notifyOnError: false,
    },
  })
}

export default useCreateVariable
