import { type GitProviderEnum } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'

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

export function buildGitProviderUrl(url: string, branch?: string) {
  const gitProvider = guessGitProvider(url)
  if (!gitProvider || !branch) {
    return url.trim().replace(/.git$/, '')
  }
  return match(gitProvider)
    .with('BITBUCKET', () => `${url.trim().replace(/.git$/, '')}/src/${branch.trim()}/`)
    .with('GITHUB', 'GITLAB', () => `${url.trim().replace(/.git$/, '')}/tree/${branch.trim()}/`)
    .exhaustive()
}
