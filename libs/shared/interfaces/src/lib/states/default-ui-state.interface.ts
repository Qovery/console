import { LoadingStatus } from '../types/loading-status.type'

export interface DefaultUiState {
  loadingStatus: LoadingStatus
  error: string | null | undefined
}
