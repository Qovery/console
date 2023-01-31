import { CloudProviderEnum, KubernetesEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { fetchAvailableInstanceTypes } from '@qovery/domains/organization'
import { ClusterResourcesData, Value } from '@qovery/shared/interfaces'
import { AppDispatch } from '@qovery/store'
import ClusterResourcesSettings from '../../ui/cluster-resources-settings/cluster-resources-settings'
import { listInstanceTypeFormatter } from './utils/list-instance-type-formatter'

export interface ClusterResourcesSettingsFeatureProps {
  fromDetail?: boolean
  cloudProvider?: CloudProviderEnum
  clusterRegion?: string
}

export function ClusterResourcesSettingsFeature(props: ClusterResourcesSettingsFeatureProps) {
  const [clusterTypeOptions, setClusterTypeOptions] = useState<Value[]>([])
  const [instanceTypeOptions, setInstanceTypeOptions] = useState<Value[]>([])
  const { watch, setValue } = useFormContext<ClusterResourcesData>()
  const dispatch = useDispatch<AppDispatch>()

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

  useEffect(() => {
    dispatch(
      fetchAvailableInstanceTypes({
        region: props.clusterRegion || '',
        clusterType: watchClusterType as KubernetesEnum,
        provider: props.cloudProvider || CloudProviderEnum.AWS,
      })
    )
      .unwrap()
      .then((data) => {
        if (data && data.results) {
          setInstanceTypeOptions(listInstanceTypeFormatter(data.results))
        } else {
          setInstanceTypeOptions([])
        }
      })
  }, [watchClusterType, dispatch, props.clusterRegion, props.cloudProvider])

  return (
    <ClusterResourcesSettings
      fromDetail={props.fromDetail}
      clusterTypeOptions={clusterTypeOptions}
      instanceTypeOptions={instanceTypeOptions}
    />
  )
}

export default ClusterResourcesSettingsFeature
