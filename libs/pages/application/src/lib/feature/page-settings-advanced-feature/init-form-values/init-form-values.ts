import { ApplicationAdvancedSettings, JobAdvancedSettings } from 'qovery-typescript-axios'
import { ServiceTypeEnum, isApplication, isContainer, isJob } from '@qovery/shared/enums'
import { GitApplicationEntity, JobApplicationEntity } from '@qovery/shared/interfaces'

export function initFormValues(
  keys: string[],
  application: GitApplicationEntity | JobApplicationEntity,
  serviceType: ServiceTypeEnum
): { [key: string]: string } {
  const values: { [key: string]: string } = {}

  keys.forEach((key) => {
    if (isApplication(serviceType) || isContainer(serviceType)) {
      const currentSettings = (application as GitApplicationEntity)?.advanced_settings?.current_settings
      if (currentSettings) {
        values[key] = currentSettings[key as keyof ApplicationAdvancedSettings]?.toString() || ''
      }
    } else if (isJob(serviceType)) {
      const currentSettings = (application as JobApplicationEntity)?.advanced_settings?.current_settings
      if (currentSettings) {
        values[key] = currentSettings[key as keyof JobAdvancedSettings]?.toString() || ''
      }
    }
  })

  return values
}
