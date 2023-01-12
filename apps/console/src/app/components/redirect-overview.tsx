import { Project } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useParams } from 'react-router-dom'
import { fetchOrganization, selectAllOrganization } from '@qovery/domains/organization'
import { fetchProjects } from '@qovery/domains/projects'
import { OVERVIEW_URL, SETTINGS_GENERAL_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { ToastEnum, toast } from '@qovery/shared/ui'
import { LoadingScreen } from '@qovery/shared/ui'
import { AppDispatch } from '@qovery/store'

export function RedirectOverview() {
  const { organizationId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const [noProject, setNoProject] = useState(false)
  const organizations = useSelector(selectAllOrganization)

  useEffect(() => {
    async function fetchCurrentOrganizationAndProjects() {
      if (organizations.length === 0) {
        await dispatch(fetchOrganization())
      }
      const projects: Project[] = await dispatch(fetchProjects({ organizationId })).unwrap()
      if (projects.length > 0) {
        window.location.href = OVERVIEW_URL(organizationId, projects[0].id)
      } else {
        setNoProject(true)
      }
    }
    fetchCurrentOrganizationAndProjects()
  }, [organizationId, dispatch, organizations])

  if (!noProject) {
    return <LoadingScreen />
  } else {
    toast(
      ToastEnum.ERROR,
      `You don't have project for this organization, please select another or create a project here`
    )
    return <Navigate to={SETTINGS_URL(organizationId) + SETTINGS_GENERAL_URL} />
  }
}

export default RedirectOverview
