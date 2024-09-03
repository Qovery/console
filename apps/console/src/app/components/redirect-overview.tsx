import { useEffect } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useOrganizations } from '@qovery/domains/organizations/feature'
import { useProjects } from '@qovery/domains/projects/feature'
import { NotFoundPage } from '@qovery/pages/layout'
import { ENVIRONMENTS_GENERAL_URL, ENVIRONMENTS_URL, SETTINGS_GENERAL_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { LoaderSpinner, ToastEnum, toast } from '@qovery/shared/ui'

function LoadingScreen() {
  return (
    <div className="flex min-h-page-container items-center justify-center rounded-t bg-neutral-50">
      <LoaderSpinner />
    </div>
  )
}

export function RedirectOverview() {
  const { organizationId = '' } = useParams()
  const navigate = useNavigate()

  const { data: organizations = [] } = useOrganizations()
  const { data: projects = [], isLoading, isFetched, error } = useProjects({ organizationId })

  useEffect(() => {
    if (projects.length > 0) {
      navigate(ENVIRONMENTS_URL(organizationId, projects[0]?.id) + ENVIRONMENTS_GENERAL_URL)
    }
  }, [organizationId, organizations, navigate, projects])

  if (isLoading || !isFetched) {
    return <LoadingScreen />
  }

  if (error) {
    return <NotFoundPage error={error} />
  }

  if (isFetched && projects.length === 0) {
    toast(
      ToastEnum.ERROR,
      `You don't have project for this organization, please select another or create a project here`
    )
    return <Navigate to={SETTINGS_URL(organizationId) + SETTINGS_GENERAL_URL} />
  }

  return <LoadingScreen />
}

export default RedirectOverview
