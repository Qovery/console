import { KubernetesEnum } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useCloudProviderFeatures } from '@qovery/domains/cloud-providers/feature'
import { type ClusterFeaturesData, type Subnets } from '@qovery/shared/interfaces'
import {
  CLUSTERS_CREATION_GENERAL_URL,
  CLUSTERS_CREATION_REMOTE_URL,
  CLUSTERS_CREATION_RESOURCES_URL,
  CLUSTERS_CREATION_SUMMARY_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import StepFeatures from '../../../ui/page-clusters-create/step-features/step-features'
import { steps, useClusterContainerCreateContext } from '../page-clusters-create-feature'

export const removeEmptySubnet = (objects?: Subnets[]) =>
  objects?.filter((field) => field.A !== '' || field.B !== '' || field.C !== '')

export function StepFeaturesFeature() {
  useDocumentTitle('Features - Create Cluster')
  const { setFeaturesData, generalData, featuresData, resourcesData, setCurrentStep, creationFlowUrl } =
    useClusterContainerCreateContext()
  const { data: features } = useCloudProviderFeatures({
    cloudProvider: generalData?.cloud_provider ?? 'AWS',
  })
  const navigate = useNavigate()

  const goToBack = () => {
    match(generalData?.cloud_provider)
      .with('GCP', () => navigate(creationFlowUrl + CLUSTERS_CREATION_GENERAL_URL))
      .otherwise(() => {
        if (resourcesData?.cluster_type === KubernetesEnum.K3_S) {
          navigate(creationFlowUrl + CLUSTERS_CREATION_REMOTE_URL)
        } else {
          navigate(creationFlowUrl + CLUSTERS_CREATION_RESOURCES_URL)
        }
      })
  }

  useEffect(() => {
    setCurrentStep(steps(generalData, resourcesData?.cluster_type).findIndex((step) => step.key === 'features') + 1)
  }, [setCurrentStep, generalData?.cloud_provider, generalData?.installation_type, resourcesData?.cluster_type])

  useEffect(() => {
    generalData?.cloud_provider !== 'GCP' &&
      !resourcesData?.cluster_type &&
      navigate(creationFlowUrl + CLUSTERS_CREATION_GENERAL_URL)
  }, [generalData?.cloud_provider, resourcesData?.cluster_type, navigate, creationFlowUrl])

  const methods = useForm<ClusterFeaturesData>({
    defaultValues: featuresData,
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit((data) => {
    if (generalData?.cloud_provider === 'AWS' || generalData?.cloud_provider === 'GCP') {
      if (data.vpc_mode === 'DEFAULT') {
        let cloneData = {}

        for (let i = 0; i < Object.keys(data.features).length; i++) {
          const id = Object.keys(data.features)[i]
          const featureData = features?.find((f) => f.id === id)
          const currentFeature = data.features[id]

          cloneData = {
            ...cloneData,
            [id]: {
              title: featureData?.title,
              value: currentFeature?.value || false,
              extendedValue: currentFeature?.extendedValue || false,
            },
          }
        }

        setFeaturesData({
          vpc_mode: 'DEFAULT',
          features: cloneData,
        })
      } else {
        if (generalData?.cloud_provider === 'AWS') {
          const existingVpcData = data.aws_existing_vpc

          setFeaturesData({
            vpc_mode: 'EXISTING_VPC',
            aws_existing_vpc: {
              aws_vpc_eks_id: existingVpcData?.aws_vpc_eks_id ?? '',
              eks_subnets: removeEmptySubnet(existingVpcData?.eks_subnets),
              eks_karpenter_fargate_subnets: removeEmptySubnet(existingVpcData?.eks_karpenter_fargate_subnets),
              mongodb_subnets: removeEmptySubnet(existingVpcData?.mongodb_subnets),
              rds_subnets: removeEmptySubnet(existingVpcData?.rds_subnets),
              redis_subnets: removeEmptySubnet(existingVpcData?.redis_subnets),
            },
            features: {},
          })
        }
        if (generalData.cloud_provider === 'GCP') {
          const existingVpcData = data.gcp_existing_vpc

          setFeaturesData({
            vpc_mode: data.vpc_mode,
            gcp_existing_vpc: existingVpcData?.vpc_name
              ? {
                  vpc_name: existingVpcData?.vpc_name ?? '',
                  vpc_project_id: existingVpcData?.vpc_project_id,
                  subnetwork_name: existingVpcData?.subnetwork_name,
                  ip_range_services_name: existingVpcData?.ip_range_services_name,
                  ip_range_pods_name: existingVpcData?.ip_range_pods_name,
                  additional_ip_range_pods_names: existingVpcData?.additional_ip_range_pods_names,
                }
              : undefined,
            features: {},
          })
        }
      }
    }

    navigate(creationFlowUrl + CLUSTERS_CREATION_SUMMARY_URL)
  })

  useEffect(() => {
    // XXX: If this is the initial render, force the value of static IP feature to `true`.
    // Backend is currently able to directly return `true` so we must force it frontend side
    // https://qovery.atlassian.net/browse/FRT-1002
    if (features && Object.keys(featuresData?.features ?? {}).length === 0) {
      const staticIp = features.find(({ id }) => id === 'STATIC_IP')
      if (staticIp && staticIp.value_object?.value === false) {
        methods.setValue('features.STATIC_IP.value', true)
      }
    }
  }, [features, featuresData])

  return (
    <FunnelFlowBody>
      <FormProvider {...methods}>
        <StepFeatures
          onSubmit={onSubmit}
          features={features}
          cloudProvider={generalData?.cloud_provider}
          goToBack={goToBack}
          isKarpenter={resourcesData?.karpenter?.enabled}
        />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepFeaturesFeature
