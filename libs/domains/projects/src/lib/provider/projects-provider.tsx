import { useDispatch } from 'react-redux'
import { postProjects } from '../slices/projects.slice'
import { ProjectRequest } from "qovery-typescript-axios";

export function useProjects() {
  const dispatch = useDispatch<any>()

  const createProject = async (organizationId: string, payload: ProjectRequest) => {
    const result = await dispatch(postProjects({ organizationId: organizationId, ...payload }))
    return result.payload
  }

  return { createProject }
}
