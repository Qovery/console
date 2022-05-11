import { EntityState } from '@reduxjs/toolkit'
import { Application, Status } from 'qovery-typescript-axios'

export interface ApplicationsState extends EntityState<Application & { status?: Status }> {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error' | undefined
  error: string | null | undefined
  joinEnvApp: Record<string, string[]>
}
