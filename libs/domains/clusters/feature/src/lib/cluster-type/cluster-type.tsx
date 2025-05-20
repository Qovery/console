import { type CloudVendorEnum, KubernetesEnum } from 'qovery-typescript-axios'
import { P, match } from 'ts-pattern'
import { Badge, type BadgeProps } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

export interface ClusterTypeProps extends Omit<BadgeProps, 'color'> {
  cloudProvider: keyof typeof CloudVendorEnum
  kubernetes?: KubernetesEnum
  instanceType?: string
}

export function ClusterType({ cloudProvider, kubernetes, instanceType, ...props }: ClusterTypeProps) {
  const clusterType = match([cloudProvider, kubernetes])
    .with(['AWS', KubernetesEnum.MANAGED], ['AWS', undefined], () =>
      instanceType === 'KARPENTER' ? `EKS (${upperCaseFirstLetter(instanceType)})` : 'EKS'
    )
    .with(['AWS', KubernetesEnum.SELF_MANAGED], ['AWS', undefined], () => 'Self-managed')
    // Scaleway
    .with(['SCW', P._], () => 'Kapsule')
    // Google GCP
    .with(['GCP', P._], () => 'GKE (Autopilot)')
    // Microsoft AZURE
    .with(['AZURE', KubernetesEnum.MANAGED], () => 'AKS (Karpenter)')
    .with(['AZURE', KubernetesEnum.SELF_MANAGED], ['AZURE', undefined], () => 'Self-managed')
    // BYOK
    .with(['ON_PREMISE', P._], () => 'On-premise')
    .with(['DO', P._], () => 'DO')
    .with(['OVH', P._], () => 'OVH')
    .with(['CIVO', P._], () => 'CIVO')
    .with(['HETZNER', P._], () => 'Hetzner')
    .with(['ORACLE', P._], () => 'Oracle')
    .with(['IBM', P._], () => 'IBM')
    .exhaustive()
  return (
    <Badge color="neutral" variant="surface" {...props}>
      {clusterType}
    </Badge>
  )
}

export default ClusterType
