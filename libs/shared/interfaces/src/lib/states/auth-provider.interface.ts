import { type GitAuthProvider, type GitTokenResponse } from 'qovery-typescript-axios'
import { type DefaultEntityState } from './default-entity-state.interface'

export interface AuthProviderState extends DefaultEntityState<GitAuthProvider | GitTokenResponse> {}
