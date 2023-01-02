import { AdvancedSettings } from '../domain/advanced-settings.interface'
import { ApplicationEntity } from '../domain/application.entity'
import { LoadingStatus } from '../types/loading-status.type'
import { DefaultEntityState } from './default-entity-state.interface'

export interface ApplicationsState extends DefaultEntityState<ApplicationEntity> {
  joinEnvApplication: Record<string, string[]>
  statusLoadingStatus: LoadingStatus
  defaultApplicationAdvancedSettings: {
    loadingStatus: LoadingStatus
    settings?: AdvancedSettings
  }
}
