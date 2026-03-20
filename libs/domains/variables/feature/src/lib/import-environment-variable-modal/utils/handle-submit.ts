import {
  APIVariableScopeEnum,
  type VariableEditRequest,
  type VariableImportRequestVarsInner,
  type VariableRequest,
} from 'qovery-typescript-axios'
import { type EnvironmentVariableSecretOrPublic } from '@qovery/shared/interfaces'

export function formatData(data: { [key: string]: string }, keys: string[]) {
  const vars: VariableImportRequestVarsInner[] = []
  if (data) {
    keys.forEach((key) => {
      vars.push({
        name: data[key + '_key'].trim(),
        value: data[key + '_value'].trim(),
        scope: data[key + '_scope'].trim() as APIVariableScopeEnum,
        is_secret: data[key + '_secret'] ? JSON.parse(data[key + '_secret'].trim?.() ?? data[key + '_secret']) : false,
      })
    })
  }
  return vars
}

interface ImportVariablesWithMutationsProps {
  vars: VariableImportRequestVarsInner[]
  overwriteEnabled: boolean
  existingVars: EnvironmentVariableSecretOrPublic[]
  projectId: string
  environmentId?: string
  serviceId?: string
  createVariable: (props: { variableRequest: VariableRequest }) => Promise<unknown>
  editVariable: (props: { variableId: string; variableEditRequest: VariableEditRequest }) => Promise<unknown>
  deleteVariable: (props: { variableId: string }) => Promise<unknown>
}

function getVariableParentId(
  scope: APIVariableScopeEnum,
  ids: Pick<ImportVariablesWithMutationsProps, 'projectId' | 'environmentId' | 'serviceId'>
) {
  switch (scope) {
    case APIVariableScopeEnum.PROJECT:
      return ids.projectId
    case APIVariableScopeEnum.ENVIRONMENT:
      if (!ids.environmentId) {
        throw new Error('Missing environmentId for environment-scoped variable import')
      }
      return ids.environmentId
    case APIVariableScopeEnum.APPLICATION:
    case APIVariableScopeEnum.CONTAINER:
    case APIVariableScopeEnum.JOB:
    case APIVariableScopeEnum.HELM:
    case APIVariableScopeEnum.TERRAFORM:
      if (!ids.serviceId) {
        throw new Error('Missing serviceId for service-scoped variable import')
      }
      return ids.serviceId
    default:
      throw new Error(`Unsupported variable scope for import: ${scope}`)
  }
}

function toVariableRequest(
  variable: VariableImportRequestVarsInner,
  ids: Pick<ImportVariablesWithMutationsProps, 'projectId' | 'environmentId' | 'serviceId'>,
  existingVar?: EnvironmentVariableSecretOrPublic
): VariableRequest {
  return {
    key: variable.name,
    value: variable.value,
    is_secret: variable.is_secret,
    variable_scope: variable.scope,
    variable_parent_id: getVariableParentId(variable.scope, ids),
    description: existingVar?.description,
    enable_interpolation_in_file: existingVar?.enable_interpolation_in_file,
  }
}

export async function importVariablesWithMutations({
  vars,
  overwriteEnabled,
  existingVars,
  projectId,
  environmentId,
  serviceId,
  createVariable,
  editVariable,
  deleteVariable,
}: ImportVariablesWithMutationsProps) {
  for (const variable of vars) {
    const existingVar = existingVars.find((envVar) => envVar.key === variable.name && envVar.scope === variable.scope)

    if (!existingVar) {
      await createVariable({
        variableRequest: toVariableRequest(variable, { projectId, environmentId, serviceId }),
      })
      continue
    }

    if (!overwriteEnabled) {
      continue
    }

    if (existingVar.is_secret === variable.is_secret) {
      await editVariable({
        variableId: existingVar.id,
        variableEditRequest: {
          key: variable.name,
          value: variable.value,
          description: existingVar.description,
          enable_interpolation_in_file: existingVar.enable_interpolation_in_file,
        },
      })
      continue
    }

    await deleteVariable({ variableId: existingVar.id })
    await createVariable({
      variableRequest: toVariableRequest(variable, { projectId, environmentId, serviceId }, existingVar),
    })
  }
}
