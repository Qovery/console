import { CloudProviderEnum, type Cluster, KubernetesEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { type ClusterResourcesData, type Value } from '@qovery/shared/interfaces'
import ClusterResourcesSettings from '../../ui/cluster-resources-settings/cluster-resources-settings'

export interface ClusterResourcesSettingsFeatureProps {
  cluster?: Cluster
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

  useEffect(() => {
    let clusterTypeOptions: Value[] = []
    if (props?.cloudProvider === CloudProviderEnum.AWS) {
      clusterTypeOptions = [
        { label: 'Managed K8S (EKS)', value: KubernetesEnum.MANAGED, description: 'Multiple node cluster' },
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
      cloudProvider={props.cloudProvider}
      clusterRegion={props.clusterRegion}
      isProduction={props.isProduction}
      hasAlreadyKarpenter={props.hasAlreadyKarpenter}
      cluster={props.cluster}
    />
  )
}

export default ClusterResourcesSettingsFeature
