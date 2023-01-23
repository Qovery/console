import { CloudProviderEnum } from 'qovery-typescript-axios'

export interface ClusterGeneralData {
  name: string
  description?: string
  production?: boolean
  cloud_provider: CloudProviderEnum
}

// export interface ClusterResourcesData {
//   memory: number
//   cpu: [number]
//   instances: [number, number]
// }
