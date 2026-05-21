import { type VariableResponse } from 'qovery-typescript-axios'

const EXTERNAL_SECRET_VARIABLE_TYPES = ['EXTERNAL_SECRET', 'FILE_EXTERNAL_SECRET']

export function isExternalSecretVariable(variable: VariableResponse): boolean {
  return EXTERNAL_SECRET_VARIABLE_TYPES.includes(variable.variable_type)
}
