import { useParams } from 'react-router-dom'
import { ClusterDeleteModal, useCluster } from '@qovery/domains/clusters/feature'
import { useModal } from '@qovery/shared/ui'
import PageSettingsDangerZone from '../../ui/page-settings-danger-zone/page-settings-danger-zone'

export function PageSettingsDangerZoneFeature() {
  const { organizationId = '', clusterId = '' } = useParams()

  const { data: cluster } = useCluster({ organizationId, clusterId })
  const { openModal } = useModal()

  const deleteCluster = () => {
    openModal({
      content: <ClusterDeleteModal organizationId={organizationId} clusterId={clusterId} name={cluster?.name ?? ''} />,
    })
  }

  return <PageSettingsDangerZone deleteCluster={deleteCluster} />
}

export default PageSettingsDangerZoneFeature
