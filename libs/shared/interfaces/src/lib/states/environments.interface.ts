import { EntityState } from '@reduxjs/toolkit'
import { EnvironmentEntity } from '../domain/environment.entity'

export interface EnvironmentsState extends EntityState<EnvironmentEntity> {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error' | undefined
  error: string | null | undefined
  joinProjectEnvironments: Record<string, string[]>
}
