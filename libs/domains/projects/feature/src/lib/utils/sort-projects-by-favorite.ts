import { type Project } from 'qovery-typescript-axios'

export function sortProjectsByFavorite(
  projects: Project[],
  isProjectFavorite: (projectId: string) => boolean
): Project[] {
  return [...projects].sort((projectA, projectB) => {
    const isProjectAFavorite = isProjectFavorite(projectA.id)
    const isProjectBFavorite = isProjectFavorite(projectB.id)

    if (isProjectAFavorite !== isProjectBFavorite) {
      return isProjectAFavorite ? -1 : 1
    }

    return projectA.name.trim().localeCompare(projectB.name.trim())
  })
}
