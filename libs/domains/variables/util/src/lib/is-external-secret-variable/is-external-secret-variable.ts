import { type VariableResponse } from 'qovery-typescript-axios'

export function isExternalSecretVariable(variable: VariableResponse): boolean {
  return variable.variable_type === 'EXTERNAL_SECRET' || variable.variable_type === 'FILE_EXTERNAL_SECRET'
}
