import { EnvironmentVariableScopeEnum } from 'qovery-typescript-axios'

export function fileToForm(file: File, applicationId: string) {}

export function jsonToForm(json: string) {
  const parsed = JSON.parse(json)
  const defaultValues: { [key: string]: string } = {}
  Object.keys(parsed).forEach((key) => {
    defaultValues[key + '_key'] = key
    defaultValues[key + '_value'] = parsed[key]
    defaultValues[key + '_scope'] = EnvironmentVariableScopeEnum.BUILT_IN
    defaultValues[key + '_secret'] = 'true'
  })

  return defaultValues
}
