import { Navigate, useSearchParams } from 'react-router-dom'
import { PREVIEW_CODE } from '@qovery/shared/routes'
import { useClusterKubeconfig } from '../hooks/use-cluster-kubeconfig/use-cluster-kubeconfig'

export function KubeconfigPreview() {
  const [searchParams] = useSearchParams()
  const organizationId = searchParams.get('organizationId')
  const clusterId = searchParams.get('clusterId')
  const { data: kubeconfig, isLoading } = useClusterKubeconfig({
    organizationId: organizationId!,
    clusterId: clusterId!,
  })

  if (!isLoading) return <Navigate to={PREVIEW_CODE} replace state={{ code: kubeconfig, language: 'yaml' }} />
  return null
}

export default KubeconfigPreview
