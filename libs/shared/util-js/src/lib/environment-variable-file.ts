import { APIVariableTypeEnum, type VariableResponse } from 'qovery-typescript-axios'

export const environmentVariableFile = (variable: VariableResponse): boolean => {
  if (variable.variable_type === APIVariableTypeEnum.ALIAS) {
    if (variable.aliased_variable?.variable_type === APIVariableTypeEnum.FILE) {
      return true
    }
  }
  if (variable.variable_type === APIVariableTypeEnum.OVERRIDE) {
    if (variable.overridden_variable?.variable_type === APIVariableTypeEnum.FILE) {
      return true
    }
  }
  return variable.variable_type === APIVariableTypeEnum.FILE
}

// mount path is stored only in the original variable. At the root of alias or override, you won't find it
// if these aliases of overrides have a parent that is a file, then we need to get the mount path from the parent
// parent variable is stored either in aliased_variable or aliased_secret or overridden_variable or overridden_secret
export const getEnvironmentVariableFileMountPath = (variable: VariableResponse | undefined): string | undefined => {
  if (!variable) return ''

  // if the variable is an alias we have to check if the parent is a file and fetch its mounth path
  if (variable.variable_type === APIVariableTypeEnum.ALIAS) {
    if (variable.aliased_variable?.variable_type === APIVariableTypeEnum.FILE) {
      return variable.aliased_variable.mount_path
    }
  }

  // if the variable is an override we have to check if the parent is a file and fetch its mounth path
  if (variable.variable_type === APIVariableTypeEnum.OVERRIDE) {
    if (variable.overridden_variable?.variable_type === APIVariableTypeEnum.FILE) {
      return variable.overridden_variable.mount_path
    }
  }

  return variable.mount_path || undefined
}
