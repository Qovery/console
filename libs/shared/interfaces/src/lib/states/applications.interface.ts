import { EntityState } from '@reduxjs/toolkit'
import { Application } from 'qovery-typescript-axios'

export interface ApplicationsState extends EntityState<Application> {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error' | undefined
  error: string | null | undefined
  joinEnvApp: Record<string, string[]>
}
