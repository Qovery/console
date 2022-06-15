import { ApplicationEntity } from '../domain/application.entity'
import { DefaultEntityState } from './default-entity-state.interface'
import { LoadingStatus } from '../types/loading-status.type'

export interface ApplicationsState extends DefaultEntityState<ApplicationEntity> {
  joinEnvApplication: Record<string, string[]>
  statusLoadingStatus: LoadingStatus
}
