import { type AdvancedSettings } from '../domain/advanced-settings.interface'
import { type ApplicationEntity } from '../domain/application.entity'
import { type LoadingStatus } from '../types/loading-status.type'
import { type DefaultEntityState } from './default-entity-state.interface'

export interface ApplicationsState extends DefaultEntityState<ApplicationEntity> {
  joinEnvApplication: Record<string, string[]>
  statusLoadingStatus: LoadingStatus
  defaultApplicationAdvancedSettings: {
    loadingStatus: LoadingStatus
    settings?: AdvancedSettings
  }
}
