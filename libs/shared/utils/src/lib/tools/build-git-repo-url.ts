export const buildGitRepoUrl = (provider: string, branch: string): string => {
  console.log(provider, branch)
  if (branch.includes('http')) return branch
  const authProvider = provider.toLowerCase()
  return `https://${authProvider}.com/${branch}.git`
}
