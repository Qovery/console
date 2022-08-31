import { ApplicationAdvancedSettings } from 'qovery-typescript-axios'
import { ApplicationEntity } from '../domain/application.entity'
import { LoadingStatus } from '../types/loading-status.type'
import { DefaultEntityState } from './default-entity-state.interface'

export interface ApplicationsState extends DefaultEntityState<ApplicationEntity> {
  joinEnvApplication: Record<string, string[]>
  statusLoadingStatus: LoadingStatus
  defaultApplicationAdvancedSettings: {
    loadingStatus: LoadingStatus
    settings?: ApplicationAdvancedSettings
  }
}
