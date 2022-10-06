import { DatabaseAccessibilityEnum, DatabaseModeEnum, DatabaseTypeEnum } from 'qovery-typescript-axios'

export interface GeneralData {
  name: string
  mode: DatabaseModeEnum
  type: DatabaseTypeEnum
  version: string
  accessibility?: DatabaseAccessibilityEnum
}

export interface ResourcesData {
  memory: number
  cpu: [number]
  memory_unit: string
  storage: number
  storage_unit: string
}
