import { type Project } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { fetchOrganization, selectAllOrganization } from '@qovery/domains/organization'
import { fetchProjects } from '@qovery/domains/projects'
import { ENVIRONMENTS_GENERAL_URL, ENVIRONMENTS_URL, SETTINGS_GENERAL_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { LoaderSpinner, ToastEnum, toast } from '@qovery/shared/ui'
import { type AppDispatch } from '@qovery/state/store'

export function RedirectOverview() {
  const { organizationId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const [noProject, setNoProject] = useState(false)
  const organizations = useSelector(selectAllOrganization)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchCurrentOrganizationAndProjects() {
      if (organizations.length === 0) {
        await dispatch(fetchOrganization())
      }
      const projects: Project[] = await dispatch(fetchProjects({ organizationId })).unwrap()
      if (projects.length > 0) {
        const filterByAlphabeticOrder = projects.sort((a, b) => a.name.localeCompare(b.name))
        navigate(ENVIRONMENTS_URL(organizationId, filterByAlphabeticOrder[0]?.id) + ENVIRONMENTS_GENERAL_URL)
      } else {
        setNoProject(true)
      }
    }
    fetchCurrentOrganizationAndProjects()
  }, [organizationId, dispatch, organizations, navigate])

  if (!noProject) {
    return (
      <div className="bg-neutral-50 flex items-center justify-center rounded-t min-h-page-container">
        <LoaderSpinner />
      </div>
    )
  } else {
    toast(
      ToastEnum.ERROR,
      `You don't have project for this organization, please select another or create a project here`
    )
    return <Navigate to={SETTINGS_URL(organizationId) + SETTINGS_GENERAL_URL} />
  }
}

export default RedirectOverview
