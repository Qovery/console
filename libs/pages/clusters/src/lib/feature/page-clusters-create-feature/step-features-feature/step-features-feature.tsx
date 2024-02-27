import { KubernetesEnum } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useCloudProviderFeatures } from '@qovery/domains/cloud-providers/feature'
import { type ClusterFeaturesData, type Subnets } from '@qovery/shared/interfaces'
import {
  CLUSTERS_CREATION_GENERAL_URL,
  CLUSTERS_CREATION_REMOTE_URL,
  CLUSTERS_CREATION_RESOURCES_URL,
  CLUSTERS_CREATION_SUMMARY_URL,
  CLUSTERS_CREATION_URL,
  CLUSTERS_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody, FunnelFlowHelpCard } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import StepFeatures from '../../../ui/page-clusters-create/step-features/step-features'
import { steps, useClusterContainerCreateContext } from '../page-clusters-create-feature'

export const removeEmptySubnet = (objects?: Subnets[]) =>
  objects?.filter((field) => field.A !== '' || field.B !== '' || field.C !== '')

export function StepFeaturesFeature() {
  useDocumentTitle('Features - Create Cluster')
  const { organizationId = '' } = useParams()
  const { setFeaturesData, generalData, featuresData, resourcesData, setCurrentStep } =
    useClusterContainerCreateContext()
  const { data: features } = useCloudProviderFeatures({ cloudProvider: generalData?.cloud_provider ?? 'AWS' })
  const navigate = useNavigate()

  const funnelCardHelp = (
    <FunnelFlowHelpCard
      title="Cluster features"
      items={[
        'A list of additional features is available depending on the cloud provider of your choice',
        'These features cannot be modified after cluster creation',
      ]}
      helpSectionProps={{
        description: 'Need help? You may find these links useful',
        links: [
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/clusters/#managing-your-clusters-with-qovery',
            linkLabel: 'How to configure my cluster',
          },
          { link: 'https://discuss.qovery.com/', linkLabel: 'Still need help? Ask on our Forum' },
        ],
      }}
    />
  )

  const goToBack = () => {
    if (resourcesData?.cluster_type === KubernetesEnum.K3_S) {
      navigate(`${CLUSTERS_URL(organizationId)}${CLUSTERS_CREATION_URL}${CLUSTERS_CREATION_REMOTE_URL}`)
    } else {
      navigate(`${CLUSTERS_URL(organizationId)}${CLUSTERS_CREATION_URL}${CLUSTERS_CREATION_RESOURCES_URL}`)
    }
  }

  useEffect(() => {
    setCurrentStep(steps(generalData, resourcesData?.cluster_type).findIndex((step) => step.key === 'features') + 1)
  }, [setCurrentStep, generalData?.cloud_provider, generalData?.installation_type, resourcesData?.cluster_type])

  useEffect(() => {
    !resourcesData?.cluster_type && navigate(CLUSTERS_CREATION_URL + CLUSTERS_CREATION_GENERAL_URL)
  }, [resourcesData?.cluster_type, navigate, organizationId])

  const methods = useForm<ClusterFeaturesData>({
    defaultValues: featuresData,
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit((data) => {
    if (data && features) {
      if (data.vpc_mode === 'DEFAULT') {
        let cloneData = {}

        for (let i = 0; i < Object.keys(data.features).length; i++) {
          const id = Object.keys(data.features)[i]
          const featureData = features.find((f) => f.id === id)
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
        const existingVpcData = data.aws_existing_vpc

        setFeaturesData({
          vpc_mode: 'EXISTING_VPC',
          aws_existing_vpc: {
            aws_vpc_eks_id: existingVpcData?.aws_vpc_eks_id ?? '',
            eks_subnets: removeEmptySubnet(existingVpcData?.eks_subnets),
            mongodb_subnets: removeEmptySubnet(existingVpcData?.mongodb_subnets),
            rds_subnets: removeEmptySubnet(existingVpcData?.rds_subnets),
            redis_subnets: removeEmptySubnet(existingVpcData?.redis_subnets),
          },
          features: {},
        })
      }

      const pathCreate = `${CLUSTERS_URL(organizationId)}${CLUSTERS_CREATION_URL}`
      navigate(pathCreate + CLUSTERS_CREATION_SUMMARY_URL)
    }
  })

  return (
    <FunnelFlowBody helpSection={funnelCardHelp}>
      <FormProvider {...methods}>
        <StepFeatures
          onSubmit={onSubmit}
          features={features}
          cloudProvider={generalData?.cloud_provider}
          goToBack={goToBack}
        />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepFeaturesFeature
