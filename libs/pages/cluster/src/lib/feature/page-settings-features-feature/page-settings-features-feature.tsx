import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { selectClusterById, selectClustersLoadingStatus } from '@qovery/domains/organization'
import { ClusterEntity } from '@qovery/shared/interfaces'
import { RootState } from '@qovery/store'
import PageSettingsFeatures from '../../ui/page-settings-features/page-settings-features'

export function PageSettingsFeaturesFeature() {
  const { clusterId = '' } = useParams()

  const cluster = useSelector<RootState, ClusterEntity | undefined>((state) => selectClusterById(state, clusterId))
  const clusterStatusLoading = useSelector((state: RootState) => selectClustersLoadingStatus(state))

  return (
    <PageSettingsFeatures
      features={cluster?.features}
      cloudProvider={cluster?.cloud_provider}
      loadingStatus={clusterStatusLoading}
    />
  )
}

export default PageSettingsFeaturesFeature
