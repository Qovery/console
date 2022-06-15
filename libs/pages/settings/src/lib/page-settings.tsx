import { selectClustersEntitiesByOrganizationId } from '@console/domains/organization'
import { INFRA_LOGS_URL } from '@console/shared/router'
import { RootState } from '@console/store/data'
import { Cluster } from 'qovery-typescript-axios'
import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'

/* eslint-disable-next-line */
export interface PageSettingsProps {}

export function PageSettings(props: PageSettingsProps) {
  const { organizationId = '' } = useParams()

  const clusters = useSelector((state: RootState) => selectClustersEntitiesByOrganizationId(state, organizationId))

  return (
    <div>
      <h1>Welcome to PageSettings!</h1>
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
    </div>
  )
}

export default PageSettings
