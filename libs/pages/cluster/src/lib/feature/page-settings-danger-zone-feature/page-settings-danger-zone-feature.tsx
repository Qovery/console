import { type Cluster } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { ClusterDeleteModal, useCluster } from '@qovery/domains/clusters/feature'
import { useModal } from '@qovery/shared/ui'
import PageSettingsDangerZone from '../../ui/page-settings-danger-zone/page-settings-danger-zone'

export function PageSettingsDangerZoneFeature() {
  const { organizationId = '', clusterId = '' } = useParams()

  const { data: cluster } = useCluster({ organizationId, clusterId })
  const { openModal } = useModal()

  const deleteCluster = (cluster: Cluster) => {
    openModal({
      content: <ClusterDeleteModal cluster={cluster} />,
    })
  }

  return cluster && <PageSettingsDangerZone deleteCluster={() => deleteCluster(cluster)} />
}

export default PageSettingsDangerZoneFeature
