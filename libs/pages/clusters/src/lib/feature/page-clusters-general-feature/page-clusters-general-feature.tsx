import { useParams } from 'react-router-dom'
import { useClusters } from '@qovery/domains/clusters/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import PageClustersGeneral from '../../ui/page-clusters-general/page-clusters-general'

export function PageClustersGeneralFeature() {
  const { organizationId = '' } = useParams()

  const { data: clusters = [], isLoading: isClustersLoading } = useClusters({ organizationId })

  useDocumentTitle('General - Clusters')

  return <PageClustersGeneral clusters={clusters} loading={isClustersLoading} />
}

export default PageClustersGeneralFeature
