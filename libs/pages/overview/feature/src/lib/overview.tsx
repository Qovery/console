import { Overview } from '@console/pages/overview/ui'
import { ENVIRONMENTS_GENERAL_URL, ENVIRONMENTS_URL } from '@console/shared/router'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'

export function OverviewPage() {
  const { organizationId, projectId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    navigate(`${ENVIRONMENTS_URL(organizationId, projectId)}${ENVIRONMENTS_GENERAL_URL}`)
  }, [navigate, organizationId, projectId])

  return <Overview />
}

export default OverviewPage
