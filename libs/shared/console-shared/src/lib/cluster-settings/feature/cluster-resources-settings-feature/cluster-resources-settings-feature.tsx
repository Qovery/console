import { CloudProviderEnum, KubernetesEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { ClusterResourcesData, Value } from '@qovery/shared/interfaces'
import ClusterResourcesSettings from '../../ui/cluster-resources-settings/cluster-resources-settings'

export interface ClusterResourcesSettingsFeatureProps {
  fromDetail?: boolean
  cloudProvider?: CloudProviderEnum
}

export function ClusterResourcesSettingsFeature(props: ClusterResourcesSettingsFeatureProps) {
  const [clusterTypeOptions, setClusterTypeOptions] = useState<Value[]>([])
  const [instanceTypeOptions, setInstanceTypeOptions] = useState<Value[]>([])
  const { watch, setValue } = useFormContext<ClusterResourcesData>()

  const watchClusterType = watch('cluster_type')

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
    } else {
      clusterTypeOptions = [
        { label: 'Managed K8S (KAPSULE)', value: KubernetesEnum.MANAGED, description: 'Multiple node cluster' },
      ]
    }
    setClusterTypeOptions(clusterTypeOptions)

    console.log(watchClusterType)
    if (!watchClusterType) {
      // set the default value
      setValue('cluster_type', clusterTypeOptions[0].value)
    }
  }, [props.cloudProvider, setValue, watchClusterType])

  useEffect(() => {
    console.log('api call to fetch the good options')
    setInstanceTypeOptions([
      { label: 't2.micro', value: 't2.micro' },
      { label: 't2.small', value: 't2.small' },
      { label: 't2.medium', value: 't2.medium' },
      { label: 't2.large', value: 't2.large' },
      { label: 't2.xlarge', value: 't2.xlarge' },
      { label: 't2.2xlarge', value: 't2.2xlarge' },
    ])
  }, [watchClusterType])

  return (
    <ClusterResourcesSettings
      fromDetail={props.fromDetail}
      clusterTypeOptions={clusterTypeOptions}
      instanceTypeOptions={instanceTypeOptions}
    />
  )
}

export default ClusterResourcesSettingsFeature
