import { Cluster } from 'qovery-typescript-axios'
import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { selectClustersEntitiesByOrganizationId } from '@console/domains/organization'
import { INFRA_LOGS_URL } from '@console/shared/router'
import { RootState } from '@console/store/data'

export function PageOrganizationClusterFeature() {
  const { organizationId = '' } = useParams()

  const clusters = useSelector((state: RootState) => selectClustersEntitiesByOrganizationId(state, organizationId))

  return (
    <ul>
      {clusters.map((cluster: Cluster, index: number) => (
        <li className="mt-4" key={index}>
          -{' '}
          <Link className="link" to={INFRA_LOGS_URL(organizationId, cluster.id)}>
            {cluster.name}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default PageOrganizationClusterFeature
