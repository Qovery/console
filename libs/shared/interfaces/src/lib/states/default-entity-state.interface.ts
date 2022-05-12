import { EntityState } from '@reduxjs/toolkit'

export interface DefaultEntityState<T> extends EntityState<T> {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error' | undefined
  error: string | null | undefined
}
