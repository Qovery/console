export const buildGitRepoUrl = (provider: string, branch: string): string => {
  if (branch.includes('http')) return branch
  const authProvider = provider.toLowerCase()
  return `https://${authProvider}.com/${branch}.git`
}
