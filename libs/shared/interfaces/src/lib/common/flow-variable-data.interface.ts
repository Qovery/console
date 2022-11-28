import { APIVariableScopeEnum } from 'qovery-typescript-axios'

export interface VariableData {
  variable?: string
  value?: string
  scope?: APIVariableScopeEnum
  isSecret: boolean
}

export interface FlowVariableData {
  variables: VariableData[]
}
