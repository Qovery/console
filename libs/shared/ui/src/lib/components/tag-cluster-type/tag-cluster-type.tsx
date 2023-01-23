import { CloudProviderEnum, KubernetesEnum } from 'qovery-typescript-axios'
import { Tag, TagSize } from '../tag/tag'

export interface TagClusterTypeProps {
  cloudProvider?: CloudProviderEnum
  kubernetes?: KubernetesEnum
  size?: TagSize
  className?: string
}

export function TagClusterType(props: TagClusterTypeProps) {
  const { cloudProvider, kubernetes, size = TagSize.NORMAL, className = '' } = props

  const content = (cloudProvider?: CloudProviderEnum, kubernetes?: KubernetesEnum): string => {
    // AWS
    if (kubernetes === KubernetesEnum.K3_S && cloudProvider === CloudProviderEnum.AWS) {
      return 'EC2 (K3S)'
    } else if (kubernetes === KubernetesEnum.MANAGED && cloudProvider === CloudProviderEnum.AWS) {
      return 'Managed (EKS)'
    }

    // Digital Ocean
    if (cloudProvider === CloudProviderEnum.DO) {
      return 'Managed (DOKS)'
    }

    // Scaleway
    if (cloudProvider === CloudProviderEnum.SCW) {
      return 'Managed (Kapsule)'
    }

    return ''
  }

  return (
    <Tag size={size} className={`border truncate ${className}`}>
      {content(cloudProvider, kubernetes)}
    </Tag>
  )
}

export default TagClusterType
