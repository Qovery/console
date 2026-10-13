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
  // TODO(secret-manager-json): Align these fields with the JSON API contract when available.
  isJson?: boolean
  keyPrefix?: string
  source?: string | null
  sourceIcon?: 'aws' | 'gcp'
  secretManagerAccessId?: string
  scope?: APIVariableScopeEnum
}

export interface FlowVariableData {
  variables: VariableData[]
  externalSecrets: ExternalSecretData[]
}
