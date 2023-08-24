import { type ApplicationGitRepository } from 'qovery-typescript-axios'

export const urlCodeEditor = (git_repository?: ApplicationGitRepository) => {
  if (!git_repository) return

  let editorUrl = 'https://gitpod.io/#' + git_repository?.url

  if (editorUrl && editorUrl.endsWith('.git')) editorUrl = editorUrl.replace('.git', '')

  if (editorUrl) editorUrl = editorUrl.concat(`/tree/${git_repository?.branch}`)

  return editorUrl
}
