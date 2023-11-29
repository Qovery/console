import { useParams } from 'react-router-dom'
import { CardCluster } from '@qovery/shared/console-shared'

export function CardClusterFeature() {
  const { organizationId = '', clusterId = '' } = useParams()

  return <CardCluster clusterId={clusterId} organizationId={organizationId} />
}

export default CardClusterFeature
