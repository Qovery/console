import { CloudProviderEnum, KubernetesEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { match } from 'ts-pattern'
import { useCloudProviderInstanceTypes } from '@qovery/domains/cloud-providers/feature'
import { type ClusterResourcesData, type Value } from '@qovery/shared/interfaces'
import ClusterResourcesSettings from '../../ui/cluster-resources-settings/cluster-resources-settings'
import { listInstanceTypeFormatter } from './utils/list-instance-type-formatter'

export interface ClusterResourcesSettingsFeatureProps {
  fromDetail?: boolean
  cloudProvider?: CloudProviderEnum
  clusterRegion?: string
  isProduction?: boolean
  hasAlreadyKarpenter?: boolean
}

export function ClusterResourcesSettingsFeature(props: ClusterResourcesSettingsFeatureProps) {
  const [clusterTypeOptions, setClusterTypeOptions] = useState<Value[]>([])
  const { watch, setValue } = useFormContext<ClusterResourcesData>()
  const watchClusterType = watch('cluster_type')

  const { data: cloudProviderInstanceTypes } = useCloudProviderInstanceTypes(
    match(props.cloudProvider || CloudProviderEnum.AWS)
      .with('AWS', (cloudProvider) => ({
        cloudProvider,
        clusterType: (watchClusterType || 'MANAGED') as (typeof KubernetesEnum)[keyof typeof KubernetesEnum],
        region: props.clusterRegion || '',
      }))
      .with('SCW', (cloudProvider) => ({
        cloudProvider,
        clusterType: 'MANAGED' as const,
        region: props.clusterRegion || '',
      }))
      .with('GCP', (cloudProvider) => ({
        cloudProvider,
        clusterType: 'MANAGED' as const,
      }))
      .with('ON_PREMISE', (cloudProvider) => ({
        cloudProvider,
        clusterType: 'MANAGED' as const,
      }))
      .exhaustive()
  )
  const instanceTypeOptions = listInstanceTypeFormatter(cloudProviderInstanceTypes ?? [])

  useEffect(() => {
    let clusterTypeOptions: Value[] = []
    if (props?.cloudProvider === CloudProviderEnum.AWS) {
      clusterTypeOptions = [
        { label: 'Managed K8S (EKS)', value: KubernetesEnum.MANAGED, description: 'Multiple node cluster' },
        {
          label: 'BETA - Single EC2 (K3S)',
          value: KubernetesEnum.K3_S,
          description: 'Single instance K3S cluster - only for dev purposes',
        },
      ]
    } else if (props?.cloudProvider === CloudProviderEnum.GCP) {
      clusterTypeOptions = [
        {
          label: 'Managed K8S (GKE with Autopilot)',
          value: KubernetesEnum.MANAGED,
          description: 'Multiple node cluster powered with Autopilot',
        },
      ]
    } else {
      clusterTypeOptions = [
        { label: 'Managed K8S (KAPSULE)', value: KubernetesEnum.MANAGED, description: 'Multiple node cluster' },
      ]
    }

    // we can't change clusterType after creation, this is why we filter the options
    if (props.fromDetail) {
      clusterTypeOptions = clusterTypeOptions.filter((option) => option.value === watchClusterType)
    }
    setClusterTypeOptions(clusterTypeOptions)

    if (!props.fromDetail && !watchClusterType) {
      // set the default value
      setValue('cluster_type', clusterTypeOptions[0].value)
    }
  }, [props.cloudProvider, setValue, watchClusterType, props.fromDetail])

  return (
    <ClusterResourcesSettings
      fromDetail={props.fromDetail}
      clusterTypeOptions={clusterTypeOptions}
      instanceTypeOptions={instanceTypeOptions}
      cloudProvider={props.cloudProvider}
      isProduction={props.isProduction}
      hasAlreadyKarpenter={props.hasAlreadyKarpenter}
    />
  )
}

export default ClusterResourcesSettingsFeature
