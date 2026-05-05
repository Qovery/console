import { type APIVariableScopeEnum } from 'qovery-typescript-axios'
import { type ServiceTypeEnum } from '@qovery/shared/enums'
import { type EnvironmentVariableSecretOrPublic } from '@qovery/shared/interfaces'
import { getScopeHierarchy } from '@qovery/shared/util-js'

type ScopeTarget = keyof typeof APIVariableScopeEnum | keyof typeof ServiceTypeEnum

export const validateKey = (
  value: string,
  existingVars: EnvironmentVariableSecretOrPublic[],
  currentScope: APIVariableScopeEnum,
  scopeTarget?: ScopeTarget
): string | boolean => {
  if (value.toLowerCase().startsWith('qovery')) {
    return 'Variable name cannot begin with "QOVERY"'
  }

  const existingVar = existingVars.find((envVar) => envVar.key === value)
  if (existingVar && getScopeHierarchy(existingVar.scope, scopeTarget) > getScopeHierarchy(currentScope, scopeTarget)) {
    return 'This variable name already exists on a lower scope'
  }

  return true
}

export const warningMessage = (
  value: string,
  existingVars: EnvironmentVariableSecretOrPublic[],
  currentScope: APIVariableScopeEnum,
  overwriteEnabled = false,
  scopeTarget?: ScopeTarget
): string | undefined => {
  const existingVar = existingVars.find((envVar) => envVar.key === value)

  if (existingVar && getScopeHierarchy(currentScope, scopeTarget) > getScopeHierarchy(existingVar.scope, scopeTarget)) {
    return 'This variable name already exists on a higher scope. An override will be created.'
  }

  if (existingVar && existingVar.scope === currentScope) {
    return overwriteEnabled
      ? 'This variable name on the same scope already exists and will be updated'
      : 'This variable already exists and will not be updated'
  }

  return undefined
}
