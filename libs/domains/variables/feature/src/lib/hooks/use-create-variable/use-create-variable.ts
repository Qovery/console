import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import type { AxiosError } from 'axios'
import { type VariableConflictResponse, type VariableRequest, type VariableResponse } from 'qovery-typescript-axios'
import { mutations } from '@qovery/domains/variables/data-access'
import { canOverrideConflictingVariable } from '@qovery/domains/variables/util'
import { toastError } from '@qovery/shared/ui'
import { isHttpStatus } from '@qovery/shared/utils'
import { queries } from '@qovery/state/util-queries'

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
    onError(error: AxiosError<VariableConflictResponse>, { variableRequest }) {
      if (!isHttpStatus(error, 409)) {
        toastError(error)
        return
      }

      const existingVariable = error.response?.data?.existing_variable
      if (!existingVariable) {
        toastError(error, 'Conflict', error.message)
        return
      }

      if (onCreateOverride && canOverrideConflictingVariable(existingVariable, variableRequest)) {
        // The 409 body never exposes the value: the override form is prefilled with the one the user typed
        const parentVariable: VariableResponse = {
          id: existingVariable.id,
          created_at: '',
          key: existingVariable.key,
          value: null,
          scope: existingVariable.scope,
          variable_type: existingVariable.variable_type,
          is_secret: existingVariable.is_secret,
          mount_path: existingVariable.mount_path,
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
      if (!orgId || !projectId) {
        toastError(error, 'Conflict', error.message)
        return
      }
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
