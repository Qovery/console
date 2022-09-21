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
