import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ProjectRequest } from 'qovery-typescript-axios'
import { postProjects, fetchProjects, selectAllProjects } from '../slices/projects.slice'

export function useProjects() {
  const dispatch = useDispatch<any>()
  const projects = useSelector(selectAllProjects)

  const getProjects = useCallback(
    async (organizationId: string) => dispatch(fetchProjects({ organizationId })),
    [dispatch]
  )

  const createProject = async (organizationId: string, payload: ProjectRequest) => {
    const result = await dispatch(postProjects({ organizationId: organizationId, ...payload }))
    return result.payload
  }

  return { projects, createProject, getProjects }
}
