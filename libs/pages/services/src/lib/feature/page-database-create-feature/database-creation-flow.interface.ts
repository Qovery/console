import { DatabaseAccessibilityEnum, DatabaseModeEnum, DatabaseTypeEnum } from 'qovery-typescript-axios'

export interface GeneralData {
  name: string
  mode: DatabaseModeEnum | undefined
  type: DatabaseTypeEnum | undefined
  version?: string
  accessibility?: DatabaseAccessibilityEnum
}

export interface ResourcesData {
  memory: number
  cpu: [number]
  instances: [number, number]
  memory_unit: string
}
