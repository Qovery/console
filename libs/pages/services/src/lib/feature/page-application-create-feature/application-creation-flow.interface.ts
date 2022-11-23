import { ServiceTypeEnum } from '@qovery/shared/enums'

export interface GeneralData {
  name: string
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

export interface ResourcesData {
  memory: number
  cpu: [number]
  instances: [number, number]
}

export interface PortData {
  ports: {
    application_port: number | undefined
    external_port: number | undefined
    is_public: boolean
  }[]
}
