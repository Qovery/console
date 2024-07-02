import { type GitProviderEnum, type GitTokenResponse, type JobLifecycleTypeEnum } from 'qovery-typescript-axios'
// eslint-disable-next-line @nx/enforce-module-boundaries
import { type ServiceTypeEnum } from '@qovery/shared/enums'

export interface JobGeneralData {
  name: string
  description: string
  lifecycle_type: keyof typeof JobLifecycleTypeEnum
  serviceType: keyof typeof ServiceTypeEnum
  auto_deploy: boolean
  labels_groups?: string[]
  annotations_groups?: string[]

  // container - docker registry source
  registry?: string
  image_name?: string
  image_tag?: string
  image_entry_point?: string
  cmd_arguments?: string
  cmd?: string[]

  // application - git source
  branch?: string
  repository?: string
  is_public_repository?: boolean
  provider?: keyof typeof GitProviderEnum
  git_token_id?: GitTokenResponse['id']
  root_path?: string
  // only for cron job, lifecycle job dockerfile info are in DockerfileSettingsData
  dockerfile_path?: string

  // template
  // dockerfile_mode: 'YES' | 'NO'
}

export interface JobConfigureData {
  timezone?: string
  schedule?: string
  event?: string
  nb_restarts?: number
  max_duration?: number
  port?: number

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
