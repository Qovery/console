import { type VariableResponse } from 'qovery-typescript-axios'

// TODO: Remove this when moving to Tanstack table
export interface EnvironmentVariableSecretOrPublic extends VariableResponse {
  is_new?: boolean
}
