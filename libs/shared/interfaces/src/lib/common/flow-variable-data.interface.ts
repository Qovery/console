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

export interface ExternalSecretData {
  name: string
  reference: string
  description?: string
  filePath?: string
  isFile?: boolean
  source?: string | null
  sourceIcon?: 'aws' | 'gcp'
  scope?: 'Application' | 'Environment'
}

export interface FlowVariableData {
  variables: VariableData[]
  externalSecrets: ExternalSecretData[]
}
