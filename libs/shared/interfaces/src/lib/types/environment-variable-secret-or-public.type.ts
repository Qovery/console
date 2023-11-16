import { type VariableResponse } from 'qovery-typescript-axios'
import { type DetectNewRowInterface } from '../common/detect-new-row.interface'

// TODO: Remove this when moving to Tanstack table
export interface EnvironmentVariableSecretOrPublic extends VariableResponse, Partial<DetectNewRowInterface> {}
