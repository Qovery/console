import { type DatabaseAccessibilityEnum, type DatabaseModeEnum, type DatabaseTypeEnum } from 'qovery-typescript-axios'

export interface GeneralData {
  name: string
  description?: string
  mode: DatabaseModeEnum
  type: DatabaseTypeEnum
  version: string
  accessibility?: DatabaseAccessibilityEnum
}

export interface ResourcesData {
  memory: number
  cpu: number
  storage: number
  instance_type?: string
}
