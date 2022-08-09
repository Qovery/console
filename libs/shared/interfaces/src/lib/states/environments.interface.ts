import { LoadingStatus } from '../..'
import { EnvironmentEntity } from '../domain/environment.entity'
import { DefaultEntityState } from './default-entity-state.interface'

export interface EnvironmentsState extends DefaultEntityState<EnvironmentEntity> {
  joinProjectEnvironments: Record<string, string[]>
  loadingEnvironmentStatus: LoadingStatus
  loadingEnvironmentDeployments: LoadingStatus
  loadingEnvironmentDeploymentRules: LoadingStatus
}
