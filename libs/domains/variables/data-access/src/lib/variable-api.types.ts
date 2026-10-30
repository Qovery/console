import {
  type VariableEditRequest as ApiVariableEditRequest,
  type VariableRequest as ApiVariableRequest,
  type VariableResponse as ApiVariableResponse,
} from 'qovery-typescript-axios'

// TODO(QOV-2351): Remove these extensions when the generated SDK includes json_target_key.
type JsonSecretSelection = { json_target_key?: string | null }

export type VariableRequest = ApiVariableRequest & JsonSecretSelection
export type VariableEditRequest = ApiVariableEditRequest & JsonSecretSelection
export type VariableResponse = ApiVariableResponse & JsonSecretSelection
