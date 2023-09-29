import { type ClusterFeature, KubernetesEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchClusterFeatures } from '@qovery/domains/organization'
import { type ClusterFeaturesData } from '@qovery/shared/interfaces'
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
import { type AppDispatch } from '@qovery/state/store'
import StepFeatures from '../../../ui/page-clusters-create/step-features/step-features'
import { steps, useClusterContainerCreateContext } from '../page-clusters-create-feature'

export function StepFeaturesFeature() {
  useDocumentTitle('Features - Create Cluster')
  const { organizationId = '' } = useParams()
  const { setFeaturesData, generalData, featuresData, resourcesData, setCurrentStep } =
    useClusterContainerCreateContext()
  const dispatch = useDispatch<AppDispatch>()
  const [features, setFeatures] = useState<ClusterFeature[]>()
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
    setCurrentStep(
      steps(generalData?.cloud_provider, resourcesData?.cluster_type).findIndex((step) => step.key === 'features') + 1
    )
  }, [setCurrentStep, generalData?.cloud_provider, resourcesData?.cluster_type])

  useEffect(() => {
    !resourcesData?.cluster_type && navigate(CLUSTERS_CREATION_URL + CLUSTERS_CREATION_GENERAL_URL)
  }, [resourcesData?.cluster_type, navigate, organizationId])

  useEffect(() => {
    if (!features && generalData?.cloud_provider)
      dispatch(fetchClusterFeatures({ cloudProvider: generalData?.cloud_provider }))
        .unwrap()
        .then((data) => setFeatures(data.results))
        .catch((error) => console.log(error))
  }, [dispatch, features, generalData?.cloud_provider])

  const methods = useForm<ClusterFeaturesData>({
    defaultValues: featuresData,
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit((data) => {
    if (data && features) {
      let cloneData = {}

      for (let i = 0; i < Object.keys(data).length; i++) {
        const id = Object.keys(data)[i]
        const featureData = features.find((f) => f.id === id)
        const currentFeature = data[id]

        cloneData = {
          ...cloneData,
          [id]: {
            title: featureData?.title,
            value: currentFeature.value || false,
            extendedValue: currentFeature.extendedValue || false,
          },
        }
      }

      setFeaturesData(cloneData)

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
