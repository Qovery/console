import { ApplicationGitRepository, GitProviderEnum } from 'qovery-typescript-axios'

export const urlCodeEditor = (git_repository?: ApplicationGitRepository) => {
  if (!git_repository) return

  let editorUrl: string | undefined = ''

  switch (git_repository?.provider) {
    case GitProviderEnum.GITHUB:
      editorUrl = git_repository.url?.replace('github.com', 'github.dev')
      break
    case GitProviderEnum.GITLAB:
    case GitProviderEnum.BITBUCKET:
      editorUrl = 'https://gitpod.io/#' + git_repository?.url
      break
  }

  if (editorUrl && editorUrl.endsWith('.git')) editorUrl = editorUrl.replace('.git', '')

  if (editorUrl) editorUrl = editorUrl.concat(`/tree/${git_repository?.branch}`)

  return editorUrl
}
