import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { deleteClusterAction, selectClusterById } from '@qovery/domains/organization'
import { ClusterEntity } from '@qovery/shared/interfaces'
import { CLUSTERS_GENERAL_URL, CLUSTERS_URL } from '@qovery/shared/routes'
import { AppDispatch, RootState } from '@qovery/state/store'
import PageSettingsDangerZone from '../../ui/page-settings-danger-zone/page-settings-danger-zone'

export function PageSettingsDangerZoneFeature() {
  const { organizationId = '', clusterId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const cluster = useSelector<RootState, ClusterEntity | undefined>((state) => selectClusterById(state, clusterId))

  const deleteCluster = () => {
    if (cluster) {
      dispatch(deleteClusterAction({ organizationId, clusterId }))
        .unwrap()
        .then(() => navigate(CLUSTERS_URL(organizationId) + CLUSTERS_GENERAL_URL))
    }
  }

  return <PageSettingsDangerZone deleteCluster={deleteCluster} cluster={cluster} />
}

export default PageSettingsDangerZoneFeature
