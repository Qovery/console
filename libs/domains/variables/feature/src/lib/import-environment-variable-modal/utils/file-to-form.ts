import { APIVariableScopeEnum } from 'qovery-typescript-axios'

export function jsonToForm(
  json: string,
  defaultScope: APIVariableScopeEnum = APIVariableScopeEnum.ENVIRONMENT
): { [key: string]: string } {
  const parsed = JSON.parse(json)
  return parsedToForm(parsed, defaultScope)
}

export function parsedToForm(
  parsed: { [key: string]: string },
  defaultScope: APIVariableScopeEnum = APIVariableScopeEnum.ENVIRONMENT
): { [key: string]: string } {
  const defaultValues: { [key: string]: string } = {}
  Object.keys(parsed).forEach((key) => {
    defaultValues[key + '_key'] = key || ''
    defaultValues[key + '_value'] = parsed[key] || ''
    defaultValues[key + '_scope'] = defaultScope
    defaultValues[key + '_secret'] = ''
  })

  return defaultValues
}
