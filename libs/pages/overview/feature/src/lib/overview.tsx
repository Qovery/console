import { Overview } from '@console/pages/overview/ui'
import { ENVIRONMENTS_URL } from '@console/shared/utils'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'

export function OverviewPage() {
  const { organizationId, projectId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    navigate(ENVIRONMENTS_URL(organizationId, projectId))
  }, [navigate, organizationId, projectId])

  return <Overview />
}

export default OverviewPage
