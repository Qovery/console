import { type GitProviderEnum } from 'qovery-typescript-axios'

export const getGitTokenValue = (value: string) => {
  if (value?.includes('TOKEN')) return { type: value.split('_')[1] as GitProviderEnum, id: value.split('_')[2] }
  return null
}

export const guessGitProvider = (url: string) => {
  const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/.*$/
  const gitlabRegex = /^(https?:\/\/)?(www\.)?gitlab\.com\/.*$/
  const bitbucketRegex = /^(https?:\/\/)?(www\.)?bitbucket\.org\/.*$/

  if (githubRegex.test(url)) {
    return 'GITHUB'
  } else if (gitlabRegex.test(url)) {
    return 'GITLAB'
  } else if (bitbucketRegex.test(url)) {
    return 'BITBUCKET'
  }

  return undefined
}
