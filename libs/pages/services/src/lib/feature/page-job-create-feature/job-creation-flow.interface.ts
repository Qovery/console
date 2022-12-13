import { ServiceTypeEnum } from '@qovery/shared/enums'

export interface GeneralData {
  name: string
  description: string
  serviceType: ServiceTypeEnum

  // container
  registry?: string
  image_name?: string
  image_tag?: string
  image_entry_point?: string
  cmd_arguments?: string
  cmd?: string[]

  // application
  build_mode?: string
  branch?: string
  repository?: string
  provider?: string
  root_path?: string
  buildpack_language?: string
  dockerfile_path?: string
}

export interface ConfigureData {
  schedule?: string
  event?: string
  nb_restarts?: number
  max_duration?: number
  port?: number

  on_stop?: {
    enabled?: boolean
    arguments?: string[]
    entrypoint?: string
  }

  on_start?: {
    enabled?: boolean
    arguments?: string[]
    entrypoint?: string
  }

  on_delete?: {
    enabled?: boolean
    arguments?: string[]
    entrypoint?: string
  }
}

export interface ResourcesData {
  memory: number
  cpu: [number]
}
