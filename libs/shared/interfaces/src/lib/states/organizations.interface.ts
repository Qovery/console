import { EntityState } from '@reduxjs/toolkit'
import { Organization } from 'qovery-typescript-axios'

export interface OrganizationState extends EntityState<Organization> {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error' | undefined
  error: string | null | undefined
}
