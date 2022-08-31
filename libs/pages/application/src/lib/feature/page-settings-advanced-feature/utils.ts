import { ApplicationAdvancedSettings } from 'qovery-typescript-axios'
import { ApplicationEntity } from '@console/shared/interfaces'

export function initFormValues(keys: string[], application: ApplicationEntity): { [key: string]: string } {
  const values: { [key: string]: string } = {}
  keys.forEach((key) => {
    if (application.advanced_settings?.current_settings) {
      values[key] =
        application.advanced_settings.current_settings[key as keyof ApplicationAdvancedSettings]?.toString() || ''
    }
  })

  return values
}
