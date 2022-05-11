import { EntityState } from '@reduxjs/toolkit'
import { Environment, Status } from 'qovery-typescript-axios'

export interface EnvironmentsState
  extends EntityState<
    Environment & {
      status?: Status
    }
  > {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error' | undefined
  error: string | null | undefined
}
