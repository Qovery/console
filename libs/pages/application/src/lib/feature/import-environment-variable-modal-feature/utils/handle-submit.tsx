import { type APIVariableScopeEnum, type VariableImportRequestVarsInner } from 'qovery-typescript-axios'

export function formatData(data: { [key: string]: string }, keys: string[]) {
  const vars: VariableImportRequestVarsInner[] = []
  if (data) {
    keys.forEach((key) => {
      vars.push({
        name: data[key + '_key'],
        value: data[key + '_value'],
        scope: data[key + '_scope'] as APIVariableScopeEnum,
        is_secret: data[key + '_secret'] ? JSON.parse(data[key + '_secret']) : false,
      })
    })
  }
  return vars
}
