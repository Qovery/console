import { EntityState } from '@reduxjs/toolkit'
import { ApplicationEntity } from '../domain/application.entity'

export interface ApplicationsState extends EntityState<ApplicationEntity> {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error' | undefined
  error: string | null | undefined
  joinEnvApp: Record<string, string[]>
}
