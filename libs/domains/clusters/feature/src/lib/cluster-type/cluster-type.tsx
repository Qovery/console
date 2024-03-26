import { type CloudProviderEnum, KubernetesEnum } from 'qovery-typescript-axios'
import { P, match } from 'ts-pattern'
import { Badge, type BadgeProps } from '@qovery/shared/ui'

export interface ClusterTypeProps extends Omit<BadgeProps, 'color'> {
  cloudProvider: keyof typeof CloudProviderEnum
  kubernetes?: KubernetesEnum
}

export function ClusterType({ cloudProvider, kubernetes, ...props }: ClusterTypeProps) {
  const clusterType = match([cloudProvider, kubernetes])
    .with(['AWS', KubernetesEnum.K3_S], () => 'EC2 (K3S)')
    .with(['AWS', KubernetesEnum.MANAGED], ['AWS', undefined], () => 'EKS')
    .with(['AWS', KubernetesEnum.SELF_MANAGED], ['AWS', undefined], () => 'Self-managed')
    // Scaleway
    .with(['SCW', P._], () => 'Kapsule')
    // Google GCP
    .with(['GCP', P._], () => 'GKE (Autopilot)')
    // BYOK
    .with(['ON_PREMISE', P._], () => 'On-premise')
    .exhaustive()
  return (
    <Badge color="neutral" {...props}>
      {clusterType}
    </Badge>
  )
}

export default ClusterType
