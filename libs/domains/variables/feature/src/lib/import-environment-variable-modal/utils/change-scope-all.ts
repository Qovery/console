import { type APIVariableScopeEnum } from 'qovery-typescript-axios'
import { type UseFormSetValue } from 'react-hook-form'

export function changeScopeForAll(
  value: APIVariableScopeEnum,
  setValue: UseFormSetValue<{ [key: string]: string }>,
  keys: (string | boolean)[]
): void {
  keys.forEach((key) => {
    setValue(key + '_scope', value?.toString())
  })
}
