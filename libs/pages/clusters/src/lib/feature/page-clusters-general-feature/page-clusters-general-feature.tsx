import { useParams } from 'react-router-dom'
import { useClusterStatuses, useClusters } from '@qovery/domains/clusters/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import PageClustersGeneral from '../../ui/page-clusters-general/page-clusters-general'

export function PageClustersGeneralFeature() {
  const { organizationId = '' } = useParams()

  const { data: clusters = [], isLoading: isClustersLoading } = useClusters({ organizationId })
  const { data: clusterStatuses = [], isLoading: isClusterStatusesLoading } = useClusterStatuses({
    organizationId,
    refetchInterval: 3000,
  })

  useDocumentTitle('General - Clusters')

  return (
    <PageClustersGeneral
      clusters={clusters}
      clusterStatuses={clusterStatuses}
      loading={isClustersLoading || isClusterStatusesLoading}
    />
  )
}

export default PageClustersGeneralFeature
