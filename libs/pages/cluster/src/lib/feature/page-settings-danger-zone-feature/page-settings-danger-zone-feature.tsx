import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { ClusterDeleteModal } from '@qovery/domains/clusters/feature'
import { selectClusterById } from '@qovery/domains/organization'
import { type ClusterEntity } from '@qovery/shared/interfaces'
import { useModal } from '@qovery/shared/ui'
import { type RootState } from '@qovery/state/store'
import PageSettingsDangerZone from '../../ui/page-settings-danger-zone/page-settings-danger-zone'

export function PageSettingsDangerZoneFeature() {
  const { organizationId = '', clusterId = '' } = useParams()

  const cluster = useSelector<RootState, ClusterEntity | undefined>((state) => selectClusterById(state, clusterId))
  const { openModal } = useModal()

  const deleteCluster = () => {
    openModal({
      content: <ClusterDeleteModal organizationId={organizationId} clusterId={clusterId} name={cluster?.name ?? ''} />,
    })
  }

  return <PageSettingsDangerZone deleteCluster={deleteCluster} />
}

export default PageSettingsDangerZoneFeature
