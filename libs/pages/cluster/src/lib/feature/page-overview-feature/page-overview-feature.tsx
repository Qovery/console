import { useParams } from 'react-router-dom'
import { ClusterCardNodeUsage, ClusterCardResources, ClusterCardSetup } from '@qovery/domains/cluster-metrics/feature'
import { useClusterRunningStatusSocket } from '@qovery/domains/clusters/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export function PageOverviewFeature() {
  const { organizationId = '', clusterId = '' } = useParams()
  useClusterRunningStatusSocket({ organizationId, clusterId })

  useDocumentTitle('Cluster - Overview')

  return (
    <div className="grid gap-6 p-8 md:grid-cols-3">
      <ClusterCardNodeUsage organizationId={organizationId} clusterId={clusterId} />
      <ClusterCardResources organizationId={organizationId} clusterId={clusterId} />
      <ClusterCardSetup organizationId={organizationId} clusterId={clusterId} />
    </div>
  )
}

export default PageOverviewFeature
