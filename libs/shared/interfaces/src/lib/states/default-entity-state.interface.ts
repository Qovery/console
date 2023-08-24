import { type EntityState } from '@reduxjs/toolkit'
import { type LoadingStatus } from '../types/loading-status.type'

export interface DefaultEntityState<T> extends EntityState<T> {
  loadingStatus: LoadingStatus
  error: string | null | undefined
}
