import { Navigate, useLocation } from '@tanstack/react-router'
import { PREVIEW_CODE } from '@qovery/shared/routes'
import { useClusterKubeconfig } from '../hooks/use-cluster-kubeconfig/use-cluster-kubeconfig'

export function KubeconfigPreview() {
  const search = useLocation({ select: (location) => location.searchStr })
  const searchParams = new URLSearchParams(search)
  const organizationId = searchParams.get('organizationId')
  const clusterId = searchParams.get('clusterId')
  const { data: kubeconfig, isLoading } = useClusterKubeconfig({
    organizationId: organizationId!,
    clusterId: clusterId!,
  })

  if (!isLoading)
    return (
      <Navigate
        to={PREVIEW_CODE}
        replace
        state={(previous) => ({ ...previous, code: kubeconfig })}
        search={{ language: 'yaml' }}
      />
    )
  return null
}

export default KubeconfigPreview
