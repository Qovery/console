import {
  type BuildModeEnum,
  type BuildPackLanguageEnum,
  type GitProviderEnum,
  type GitTokenResponse,
} from 'qovery-typescript-axios'
// eslint-disable-next-line @nx/enforce-module-boundaries
import { type ServiceTypeEnum } from '@qovery/shared/enums'

export interface JobGeneralData {
  name: string
  description: string
  serviceType: ServiceTypeEnum
  auto_deploy: boolean

  // container
  registry?: string
  image_name?: string
  image_tag?: string
  image_entry_point?: string

  // application
  build_mode?: keyof typeof BuildModeEnum
  branch?: string
  repository?: string
  provider?: keyof typeof GitProviderEnum
  git_token_id?: GitTokenResponse['id']
  root_path?: string
  buildpack_language?: keyof typeof BuildPackLanguageEnum
  dockerfile_path?: string
}

export interface JobConfigureData {
  timezone?: string
  schedule?: string
  event?: string
  nb_restarts?: number
  max_duration?: number
  port?: number

  cmd_arguments?: string
  cmd?: string[]
  image_entry_point?: string

  on_stop?: {
    enabled?: boolean
    arguments?: string[]
    arguments_string?: string
    entrypoint?: string
  }

  on_start?: {
    enabled?: boolean
    arguments?: string[]
    arguments_string?: string
    entrypoint?: string
  }

  on_delete?: {
    enabled?: boolean
    arguments?: string[]
    arguments_string?: string
    entrypoint?: string
  }
}

export interface JobResourcesData {
  memory: number
  cpu: number
}
