import { type GitProviderEnum, type GitRepository, type GitRepositoryBranch } from 'qovery-typescript-axios'
import { type LoadingStatus } from '../types/loading-status.type'

export interface RepositoryEntity extends GitRepository {
  branches: {
    loadingStatus: LoadingStatus
    items?: GitRepositoryBranch[]
  }
  provider: GitProviderEnum
}
