import { APIVariableTypeEnum } from 'qovery-typescript-axios'
import { EnvironmentVariableSecretOrPublic } from '@qovery/shared/interfaces'

// todo remove the any once the api is updated
export const environmentVariableFile = (variable: EnvironmentVariableSecretOrPublic): boolean => {
  if (variable.variable_type === APIVariableTypeEnum.ALIAS) {
    if (
      variable.aliased_variable?.variable_type === APIVariableTypeEnum.FILE ||
      variable.aliased_secret?.variable_type === APIVariableTypeEnum.FILE
    ) {
      return true
    }
  }
  if (variable.variable_type === APIVariableTypeEnum.OVERRIDE) {
    if (
      variable.overridden_variable?.variable_type === APIVariableTypeEnum.FILE ||
      variable.overridden_secret?.variable_type === APIVariableTypeEnum.FILE
    ) {
      return true
    }
  }
  return variable.variable_type === APIVariableTypeEnum.FILE
}

export const getEnvironmentVariableFileMountPath = (variable: EnvironmentVariableSecretOrPublic | any): string => {
  if (variable.variable_type === APIVariableTypeEnum.ALIAS) {
    if (variable.aliased_variable?.variable_type === APIVariableTypeEnum.FILE) {
      return variable.aliased_variable.mount_path
    }

    if (variable.aliased_secret?.variable_type === APIVariableTypeEnum.FILE) {
      return variable.aliased_secret.mount_path
    }
  }
  if (variable.variable_type === APIVariableTypeEnum.OVERRIDE) {
    if (variable.overridden_variable?.variable_type === APIVariableTypeEnum.FILE) {
      return variable.overridden_variable.mount_path
    }

    if (variable.overridden_secret?.variable_type === APIVariableTypeEnum.FILE) {
      return variable.overridden_secret.mount_path
    }
  }
  return variable.mount_path
}
