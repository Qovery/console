import { AppDispatch } from '@console/store/data'
import { useDispatch } from 'react-redux'
import { ProjectsInterface, postProjects } from '../slices/projects.slice'

export function useProjects() {
  const dispatch = useDispatch<AppDispatch>()

  const createProject = async (organizationId: string, payload: ProjectsInterface) => {
    const result = await dispatch(postProjects({ organizationId: organizationId, ...payload }))
    return result.payload
  }

  return { createProject }
}
