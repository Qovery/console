import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { selectClustersEntitiesByOrganizationId, selectClustersLoadingStatus } from '@qovery/domains/organization'
import { RootState } from '@qovery/store'
import PageClustersGeneral from '../../ui/page-clusters-general/page-clusters-general'

export function PageClustersGeneralFeature() {
  const { organizationId = '' } = useParams()

  const clusters = useSelector((state: RootState) => selectClustersEntitiesByOrganizationId(state, organizationId))
  const clustersLoading = useSelector((state: RootState) => selectClustersLoadingStatus(state))

  return <PageClustersGeneral clusters={clusters} loading={clustersLoading} />
}

export default PageClustersGeneralFeature
