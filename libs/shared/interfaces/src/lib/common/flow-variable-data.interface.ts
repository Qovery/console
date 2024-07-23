import { type APIVariableScopeEnum, type LifecycleTemplateResponseVariablesInnerFile } from 'qovery-typescript-axios'

export interface VariableData {
  variable?: string
  value?: string
  scope?: APIVariableScopeEnum
  isSecret: boolean
  isReadOnly?: boolean
  file?: LifecycleTemplateResponseVariablesInnerFile
  description?: string
}

export interface FlowVariableData {
  variables: VariableData[]
}
