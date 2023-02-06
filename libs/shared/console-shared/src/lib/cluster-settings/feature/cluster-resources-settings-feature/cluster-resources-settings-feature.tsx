import { CloudProviderEnum, KubernetesEnum } from 'qovery-typescript-axios'
import { ClusterInstanceTypeResponseListResults } from 'qovery-typescript-axios/api'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAvailableInstanceTypes, selectInstancesTypes } from '@qovery/domains/organization'
import { ClusterResourcesData, Value } from '@qovery/shared/interfaces'
import { AppDispatch, RootState } from '@qovery/store'
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
  const availableInstanceTypes = useSelector<RootState, ClusterInstanceTypeResponseListResults[] | undefined>((state) =>
    selectInstancesTypes(
      state,
      props.cloudProvider || CloudProviderEnum.AWS,
      watchClusterType as KubernetesEnum,
      props.clusterRegion || ''
    )
  )

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
    if (!availableInstanceTypes) {
      if (watchClusterType && props.clusterRegion && props.cloudProvider)
        dispatch(
          fetchAvailableInstanceTypes({
            region: props.clusterRegion,
            clusterType: watchClusterType as KubernetesEnum,
            provider: props.cloudProvider,
          })
        )
    } else {
      const list = listInstanceTypeFormatter(availableInstanceTypes)
      setInstanceTypeOptions(list)
    }
  }, [watchClusterType, dispatch, props.clusterRegion, props.cloudProvider, availableInstanceTypes])

  return (
    <ClusterResourcesSettings
      fromDetail={props.fromDetail}
      clusterTypeOptions={clusterTypeOptions}
      instanceTypeOptions={instanceTypeOptions}
      cloudProvider={props.cloudProvider}
    />
  )
}

export default ClusterResourcesSettingsFeature
