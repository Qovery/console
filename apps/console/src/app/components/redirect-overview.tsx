import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { fetchOrganization, selectAllOrganization } from '@qovery/domains/organization'
import { useProjects } from '@qovery/domains/projects/feature'
import { ENVIRONMENTS_GENERAL_URL, ENVIRONMENTS_URL, SETTINGS_GENERAL_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { LoaderSpinner, ToastEnum, toast } from '@qovery/shared/ui'
import { type AppDispatch } from '@qovery/state/store'

export function RedirectOverview() {
  const { organizationId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const organizations = useSelector(selectAllOrganization)
  const navigate = useNavigate()
  const { data: projects = [], isLoading, isFetched } = useProjects({ organizationId })

  useEffect(() => {
    async function fetchCurrentOrganizationAndProjects() {
      if (organizations.length === 0) {
        await dispatch(fetchOrganization())
      }
      if (projects.length > 0) {
        const filterByAlphabeticOrder = projects.sort((a, b) => a.name.localeCompare(b.name))
        navigate(ENVIRONMENTS_URL(organizationId, filterByAlphabeticOrder[0]?.id) + ENVIRONMENTS_GENERAL_URL)
      }
    }
    fetchCurrentOrganizationAndProjects()
  }, [organizationId, dispatch, organizations, navigate, projects])

  if (isLoading) {
    return (
      <div className="bg-neutral-50 flex items-center justify-center rounded-t min-h-page-container">
        <LoaderSpinner />
      </div>
    )
  }

  if (isFetched && projects.length === 0) {
    toast(
      ToastEnum.ERROR,
      `You don't have project for this organization, please select another or create a project here`
    )
    return <Navigate to={SETTINGS_URL(organizationId) + SETTINGS_GENERAL_URL} />
  }

  return null
}

export default RedirectOverview
