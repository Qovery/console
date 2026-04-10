import { EnvironmentModeEnum } from 'qovery-typescript-axios'

export const defaultProjectPermission = (permission: string) => {
  return [
    {
      environment_type: EnvironmentModeEnum.DEVELOPMENT,
      permission: permission,
    },
    {
      environment_type: EnvironmentModeEnum.PREVIEW,
      permission: permission,
    },
    {
      environment_type: EnvironmentModeEnum.STAGING,
      permission: permission,
    },
    {
      environment_type: EnvironmentModeEnum.PRODUCTION,
      permission: permission,
    },
  ]
}
