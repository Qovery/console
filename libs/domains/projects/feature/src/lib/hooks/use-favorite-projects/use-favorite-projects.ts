import { type Project } from 'qovery-typescript-axios'
import { useLocalStorage } from '@qovery/shared/util-hooks'

const MAX_FAVORITE_PROJECTS = 50

interface StoredProject extends Project {
  organizationId: string
}

interface FavoriteProjectsStorage {
  [organizationId: string]: StoredProject[]
}

export const useFavoriteProjects = ({ organizationId }: { organizationId: string }) => {
  const [favoriteProjectsStorage, setFavoriteProjectsStorage] = useLocalStorage<FavoriteProjectsStorage>(
    'qovery-favorite-projects',
    {}
  )

  const getFavoriteProjects = (): Project[] => {
    return favoriteProjectsStorage[organizationId] || []
  }

  const addToFavoriteProjects = (project: Project): void => {
    const orgFavorites = favoriteProjectsStorage[organizationId] || []
    const isAlreadyFavorite = orgFavorites.some((favoriteProject) => favoriteProject.id === project.id)

    if (isAlreadyFavorite) return

    const projectWithOrg = { ...project, organizationId }
    const updatedOrgFavorites = [projectWithOrg, ...orgFavorites].slice(0, MAX_FAVORITE_PROJECTS)

    setFavoriteProjectsStorage({
      ...favoriteProjectsStorage,
      [organizationId]: updatedOrgFavorites,
    })
  }

  const removeFromFavoriteProjects = (projectId: string): void => {
    const orgFavorites = favoriteProjectsStorage[organizationId] || []
    const updatedOrgFavorites = orgFavorites.filter((project) => project.id !== projectId)

    setFavoriteProjectsStorage({
      ...favoriteProjectsStorage,
      [organizationId]: updatedOrgFavorites,
    })
  }

  const toggleFavoriteProject = (project: Project): boolean => {
    const orgFavorites = favoriteProjectsStorage[organizationId] || []
    const isAlreadyFavorite = orgFavorites.some((favoriteProject) => favoriteProject.id === project.id)

    if (isAlreadyFavorite) {
      removeFromFavoriteProjects(project.id)
      return false
    }

    addToFavoriteProjects(project)
    return true
  }

  const isProjectFavorite = (projectId: string): boolean => {
    const orgFavorites = favoriteProjectsStorage[organizationId] || []
    return orgFavorites.some((favoriteProject) => favoriteProject.id === projectId)
  }

  const clearFavoriteProjects = (): void => {
    setFavoriteProjectsStorage({
      ...favoriteProjectsStorage,
      [organizationId]: [],
    })
  }

  return {
    getFavoriteProjects,
    addToFavoriteProjects,
    removeFromFavoriteProjects,
    toggleFavoriteProject,
    isProjectFavorite,
    clearFavoriteProjects,
  }
}

export default useFavoriteProjects
