export const buildGitRepoUrl = (provider: string, branch: string): string => {
  if (branch.includes('http://') || branch.includes('https://')) return branch
  const authProvider = provider.toLowerCase()
  return `https://${authProvider}.com/${branch}.git`
}
