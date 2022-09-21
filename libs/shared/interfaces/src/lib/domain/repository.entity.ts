import { GitProviderEnum, GitRepository, GitRepositoryBranch } from 'qovery-typescript-axios'
import { LoadingStatus } from '../types/loading-status.type'

export interface RepositoryEntity extends GitRepository {
  branches: {
    loadingStatus: LoadingStatus
    items?: GitRepositoryBranch[]
  }
  provider: GitProviderEnum
}
