import { ClusterAdvancedSettings } from 'qovery-typescript-axios'
import { ClusterEntity } from '@qovery/shared/interfaces'

export function initFormValues(keys: string[], cluster: ClusterEntity): { [key: string]: string } {
  const values: { [key: string]: string } = {}

  keys.forEach((key) => {
    const currentSettings = cluster?.advanced_settings?.current_settings
    if (currentSettings) {
      values[key] = currentSettings[key as keyof ClusterAdvancedSettings]?.toString() || ''
    }
  })

  return values
}
