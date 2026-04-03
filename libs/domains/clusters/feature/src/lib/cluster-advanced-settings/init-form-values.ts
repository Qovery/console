import { type ClusterAdvancedSettings } from 'qovery-typescript-axios'

export function initFormValues(keys: string[], currentSettings: ClusterAdvancedSettings): { [key: string]: string } {
  const values: { [key: string]: string } = {}

  keys.forEach((key) => {
    if (currentSettings) {
      const value = currentSettings[key as keyof ClusterAdvancedSettings]
      values[key] = (typeof value === 'object' ? JSON.stringify(value) : value?.toString()) || ''
    }
  })

  return values
}
