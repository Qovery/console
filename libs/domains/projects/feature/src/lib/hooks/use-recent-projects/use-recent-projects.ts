import { type Project } from 'qovery-typescript-axios'
import { useLocalStorage } from '@qovery/shared/util-hooks'

const MAX_RECENT_PROJECTS = 1

interface StoredProject extends Project {
  timestamp: number
  organizationId: string
}

interface RecentProjectsStorage {
  [organizationId: string]: StoredProject[]
}

export const useRecentProjects = ({ organizationId }: { organizationId: string }) => {
  const [recentProjectsStorage, setRecentProjectsStorage] = useLocalStorage<RecentProjectsStorage>(
    'qovery-recent-projects',
    {}
  )

  const getRecentProjects = (): Project[] => {
    return recentProjectsStorage[organizationId] || []
  }

  const addToRecentProjects = (project: Project): void => {
    const orgRecents = recentProjectsStorage[organizationId] || []
    const projectWithMetadata = {
      ...project,
      timestamp: Date.now(),
      organizationId,
    }

    const filteredOrgRecents = orgRecents.filter((recentProject) => recentProject.id !== project.id)
    const updatedOrgRecents = [projectWithMetadata, ...filteredOrgRecents].slice(0, MAX_RECENT_PROJECTS)

    setRecentProjectsStorage({
      ...recentProjectsStorage,
      [organizationId]: updatedOrgRecents,
    })
  }

  const clearRecentProjects = (): void => {
    setRecentProjectsStorage({
      ...recentProjectsStorage,
      [organizationId]: [],
    })
  }

  return {
    getRecentProjects,
    addToRecentProjects,
    clearRecentProjects,
  }
}

export default useRecentProjects
