import { useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@console/store/data'
import { useEffect } from 'react'
import { Project } from 'qovery-typescript-axios'
import { fetchProjects } from '@console/domains/projects'
import { OVERVIEW_URL } from '@console/shared/router'
import { LoadingScreen } from '@console/shared/ui'

export function RedirectOverview() {
  const { organizationId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    async function fetchCurrentProjects() {
      const projects: Project[] = await dispatch(fetchProjects({ organizationId })).unwrap()
      if (projects.length > 0) {
        window.location.href = OVERVIEW_URL(organizationId, projects[0].id)
      }
    }
    fetchCurrentProjects()
  }, [organizationId, dispatch])

  return <LoadingScreen />
}

export default RedirectOverview
