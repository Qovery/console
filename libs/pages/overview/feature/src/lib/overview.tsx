import { Navigate, useParams } from 'react-router-dom'
import { ENVIRONMENTS_GENERAL_URL, ENVIRONMENTS_URL } from '@qovery/shared/routes'

export function OverviewPage() {
  const { organizationId, projectId } = useParams()

  return <Navigate to={`${ENVIRONMENTS_URL(organizationId, projectId)}${ENVIRONMENTS_GENERAL_URL}`} replace />
}

export default OverviewPage
