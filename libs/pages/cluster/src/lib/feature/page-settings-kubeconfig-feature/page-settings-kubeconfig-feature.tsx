import { type Cluster } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { useCluster, useEditClusterKubeconfig } from '@qovery/domains/clusters/feature'
import { PageSettingsKubeconfig } from '../../ui/page-settings-kubeconfig/page-settings-kubeconfig'

export function PageSettingsKubeconfigFeature() {
  const { organizationId = '', clusterId = '' } = useParams()

  const { data: cluster } = useCluster({ organizationId, clusterId })
  const { mutate: editClusterKubeconfig } = useEditClusterKubeconfig()

  const onSubmit = (cluster: Cluster, kubeconfig: string) => {
    editClusterKubeconfig({
      clusterId: cluster.id,
      organizationId: organizationId,
      payload: kubeconfig,
    })
  }

  return cluster && <PageSettingsKubeconfig cluster={cluster} onSubmit={onSubmit} />
}

export default PageSettingsKubeconfigFeature
