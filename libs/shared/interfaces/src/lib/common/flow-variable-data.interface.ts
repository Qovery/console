import { type APIVariableScopeEnum } from 'qovery-typescript-axios'

export interface VariableData {
  variable?: string
  value?: string
  scope?: APIVariableScopeEnum
  isSecret: boolean
  isDisabled?: boolean
}

export interface FlowVariableData {
  variables: VariableData[]
}
