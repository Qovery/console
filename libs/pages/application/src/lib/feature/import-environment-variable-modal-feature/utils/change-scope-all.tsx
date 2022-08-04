import { EnvironmentVariableScopeEnum } from 'qovery-typescript-axios'
import { UseFormSetValue } from 'react-hook-form'

export function changeScopeForAll(
  value: EnvironmentVariableScopeEnum,
  setValue: UseFormSetValue<{ [key: string]: string }>,
  keys: string[],
  getValues: () => { [key: string]: string }
): void {
  keys.forEach((key) => {
    setValue(key + '_scope', value?.toString())
  })
}
