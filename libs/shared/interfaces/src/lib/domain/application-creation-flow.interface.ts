import { type BuildModeEnum, type GitProviderEnum, type GitTokenResponse } from 'qovery-typescript-axios'
// eslint-disable-next-line @nx/enforce-module-boundaries
import { type ServiceTypeEnum } from '@qovery/shared/enums'

export interface ApplicationGeneralData {
  name: string
  description?: string
  // NOTE: This does NOT represent the current serviceType created
  // This represents rather the source type underneath: existing docker image (CONTAINER) / custom dockerfile (APPLICATION)
  serviceType: keyof typeof ServiceTypeEnum
  auto_deploy: boolean
  labels_groups?: string[]
  annotations_groups?: string[]
  icon_uri?: string
  build_mode?: keyof typeof BuildModeEnum

  // container
  registry?: string
  image_name?: string
  image_tag?: string
  image_entry_point?: string
  cmd_arguments?: string
  cmd?: string[]

  // application
  branch?: string
  repository?: string
  is_public_repository?: boolean
  provider?: keyof typeof GitProviderEnum
  git_token_id?: GitTokenResponse['id']
  root_path?: string
  dockerfile_path?: string | null
}

export interface ApplicationResourcesData {
  memory: number
  cpu: number
  min_running_instances: number
  max_running_instances: number
}
