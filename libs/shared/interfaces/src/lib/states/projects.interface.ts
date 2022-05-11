import { EntityState } from '@reduxjs/toolkit'
import { Project } from 'qovery-typescript-axios'

export interface ProjectsState extends EntityState<Project> {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error' | undefined
  error: string | null | undefined
}
