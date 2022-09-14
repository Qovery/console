import { Navigate, useParams } from 'react-router'
import { ENVIRONMENTS_GENERAL_URL, ENVIRONMENTS_URL } from '@qovery/shared/router'

export function OverviewPage() {
  const { organizationId, projectId } = useParams()

  return <Navigate to={`${ENVIRONMENTS_URL(organizationId, projectId)}${ENVIRONMENTS_GENERAL_URL}`} replace />
}

export default OverviewPage
