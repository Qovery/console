import { ServiceTypeEnum } from '@qovery/shared/enums'

export interface GlobalData {
  name: string
  applicationSource: ServiceTypeEnum

  // container
  registry?: string

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
  vcpu: string
}

export interface ResourcesData {
  vcpu: string
}
