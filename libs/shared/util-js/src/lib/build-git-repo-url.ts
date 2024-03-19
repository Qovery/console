// TODO: move to '@qovery/shared/util-git'
export const buildGitRepoUrl = (provider: string, repository: string): string => {
  if (repository.includes('http://') || repository.includes('https://')) return repository
  const authProvider = provider.toLowerCase()
  return `https://${authProvider}.com/${repository}.git`
}
