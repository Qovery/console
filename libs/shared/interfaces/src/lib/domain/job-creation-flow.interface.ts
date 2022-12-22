import { ServiceTypeEnum } from '@qovery/shared/enums'

export interface JobGeneralData {
  name: string
  description: string
  serviceType: ServiceTypeEnum

  // container
  registry?: string
  image_name?: string
  image_tag?: string
  image_entry_point?: string

  // application
  build_mode?: string
  branch?: string
  repository?: string
  provider?: string
  root_path?: string
  buildpack_language?: string
  dockerfile_path?: string
}

export interface JobConfigureData {
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
  cpu: [number]
}
