import { APIVariableScopeEnum } from 'qovery-typescript-axios'

export function jsonToForm(json: string): { [key: string]: string } {
  const parsed = JSON.parse(json)
  return parsedToForm(parsed)
}

export function parsedToForm(parsed: { [key: string]: string }): { [key: string]: string } {
  const defaultValues: { [key: string]: string } = {}
  Object.keys(parsed).forEach((key) => {
    defaultValues[key + '_key'] = key || ''
    defaultValues[key + '_value'] = parsed[key] || ''
    defaultValues[key + '_scope'] = APIVariableScopeEnum.ENVIRONMENT
    defaultValues[key + '_secret'] = ''
  })

  return defaultValues
}
