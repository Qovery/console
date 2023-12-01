import { useParams } from 'react-router-dom'
import { useCluster } from '@qovery/domains/clusters/feature'
import PageSettingsFeatures from '../../ui/page-settings-features/page-settings-features'

export function PageSettingsFeaturesFeature() {
  const { organizationId = '', clusterId = '' } = useParams()

  const { data: cluster, isLoading: isClusterLoading } = useCluster({ organizationId, clusterId })

  return (
    <PageSettingsFeatures
      features={cluster?.features}
      cloudProvider={cluster?.cloud_provider}
      loading={isClusterLoading}
    />
  )
}

export default PageSettingsFeaturesFeature
