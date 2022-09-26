import { AvailableContainerRegistryResponse } from 'qovery-typescript-axios'
import { DefaultUiState } from './default-ui-state.interface'

export interface AvailableContainerRegistryState extends DefaultUiState {
  items: AvailableContainerRegistryResponse[]
}
