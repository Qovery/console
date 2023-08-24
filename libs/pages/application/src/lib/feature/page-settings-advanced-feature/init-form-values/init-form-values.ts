import { type ApplicationAdvancedSettings, type JobAdvancedSettings } from 'qovery-typescript-axios'
import { type ServiceTypeEnum, isApplication, isContainer, isJob } from '@qovery/shared/enums'
import { type ApplicationEntity, type GitApplicationEntity } from '@qovery/shared/interfaces'

export function initFormValues(
  keys: string[],
  application: ApplicationEntity,
  serviceType: ServiceTypeEnum
): { [key: string]: string } {
  const values: { [key: string]: string } = {}

  keys.forEach((key) => {
    if (isApplication(serviceType) || isContainer(serviceType)) {
      const currentSettings = (application as GitApplicationEntity)?.advanced_settings?.current_settings
      if (currentSettings) {
        const value = currentSettings[key as keyof ApplicationAdvancedSettings]
        values[key] = (typeof value === 'object' ? JSON.stringify(value) : value?.toString()) || ''
      }
    } else if (isJob(serviceType)) {
      const currentSettings = application?.advanced_settings?.current_settings
      if (currentSettings) {
        const value = currentSettings[key as keyof JobAdvancedSettings]
        values[key] = (typeof value === 'object' ? JSON.stringify(value) : value?.toString()) || ''
      }
    }
  })

  return values
}
