import { UseFormSetValue } from 'react-hook-form'

export function triggerToggleAll(
  value: boolean,
  setValue: UseFormSetValue<{ [key: string]: string }>,
  keys: string[]
): void {
  keys.forEach((key) => {
    setValue(key + '_secret', value ? 'true' : 'false')
  })
}
