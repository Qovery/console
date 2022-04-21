import { useParams } from 'react-router'
import { Link } from 'react-router-dom'
import { ENVIRONMENTS_URL } from '@console/shared/utils'

export function Overview() {
  const { organizationId, projectId } = useParams()

  return (
    <div>
      <h2 className="text-3xl font-extrabold text-brand-500">Overview</h2>
      <ul className="mt-8">
        <Link className="link text-accent2-500" to={ENVIRONMENTS_URL(organizationId, projectId)}>
          Go to environments
        </Link>
      </ul>
    </div>
  )
}

export default Overview
