import { type APIVariableScopeEnum } from 'qovery-typescript-axios'
import { type ServiceTypeEnum } from '@qovery/shared/enums'
import { type EnvironmentVariableSecretOrPublic } from '@qovery/shared/interfaces'
import { getScopeHierarchy } from '@qovery/shared/util-js'

export const validateKey = (
  value: string,
  existingVars: EnvironmentVariableSecretOrPublic[],
  currentScope: APIVariableScopeEnum,
  serviceType?: ServiceTypeEnum
): string | boolean => {
  if (value.toLowerCase().startsWith('qovery')) {
    return 'Variable name cannot begin with "QOVERY"'
  }

  const existingVar = existingVars.find((envVar) => envVar.key === value)
  if (existingVar && getScopeHierarchy(existingVar.scope, serviceType) > getScopeHierarchy(currentScope, serviceType)) {
    return 'This variable name already exists on a lower scope'
  }

  return true
}

export const warningMessage = (
  value: string,
  existingVars: EnvironmentVariableSecretOrPublic[],
  currentScope: APIVariableScopeEnum,
  overwriteEnabled = false,
  serviceType?: ServiceTypeEnum
): string | undefined => {
  const existingVar = existingVars.find((envVar) => envVar.key === value)

  if (existingVar && getScopeHierarchy(currentScope, serviceType) > getScopeHierarchy(existingVar.scope, serviceType)) {
    return 'This variable name already exists on a higher scope. An override will be created.'
  }

  if (existingVar && existingVar.scope === currentScope) {
    return overwriteEnabled
      ? 'This variable name on the same scope already exists and will be updated'
      : 'This variable already exists and will not be updated'
  }

  return undefined
}
