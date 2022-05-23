import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ProjectRequest } from 'qovery-typescript-axios'
import { fetchProjects, postProject, selectAllProjects } from '../slices/projects.slice'
import { AppDispatch } from '@console/store/data'

export function useProjects() {
  const dispatch = useDispatch<AppDispatch>()
  const projects = useSelector(selectAllProjects)

  const getProjects = useCallback(
    async (organizationId: string) => dispatch(fetchProjects({ organizationId })),
    [dispatch]
  )

  const createProject = async (organizationId: string, payload: ProjectRequest) => {
    const result = await dispatch(postProject({ organizationId: organizationId, ...payload }))
    return result.payload
  }

  return { projects, createProject, getProjects }
}
