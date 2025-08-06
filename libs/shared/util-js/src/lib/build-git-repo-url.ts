import { type GitRepository } from "qovery-typescript-axios"

// TODO: move to '@qovery/shared/util-git'
export const buildGitRepoUrl = (provider: string, repository: string): string => {
  if (repository.includes('http://') || repository.includes('https://')) return repository
  const authProvider = provider.toLowerCase()
  return `https://${authProvider}.com/${repository}.git`
}


export const buildGitRepoUrlFromGitRepository = (repository: GitRepository | undefined): string => {
  if (!repository) return ''
  return repository.url
}