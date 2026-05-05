import { type UseFormSetValue } from 'react-hook-form'

export function triggerToggleAll(
  value: boolean,
  setValue: UseFormSetValue<{ [key: string]: string | boolean }>,
  keys: string[]
): void {
  keys.forEach((key) => {
    setValue(key + '_secret', value)
  })
}
