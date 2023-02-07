import { ClusterFeature } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { fetchClusterFeatures } from '@qovery/domains/organization'
import { ClusterFeaturesData } from '@qovery/shared/interfaces'
import { FunnelFlowBody, FunnelFlowHelpCard } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch } from '@qovery/store'
import StepFeatures from '../../../ui/page-clusters-create/step-features/step-features'
import { useClusterContainerCreateContext } from '../page-clusters-create-feature'

export function StepFeaturesFeature() {
  useDocumentTitle('Features - Create Cluster')
  const { setFeaturesData, generalData, featuresData, setCurrentStep } = useClusterContainerCreateContext()
  const dispatch = useDispatch<AppDispatch>()
  const [features, setFeatures] = useState<ClusterFeature[]>()

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
            external: true,
          },
          { link: 'https://discuss.qovery.com/', linkLabel: 'Still need help? Ask on our Forum', external: true },
        ],
      }}
    />
  )

  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  const methods = useForm<ClusterFeaturesData>({
    defaultValues: featuresData,
    mode: 'onChange',
  })

  useEffect(() => {
    if (!features && generalData?.cloud_provider)
      dispatch(fetchClusterFeatures({ cloudProvider: generalData?.cloud_provider }))
        .unwrap()
        .then((data) => setFeatures(data.results))
        .catch((error) => console.log(error))
  }, [dispatch, features, generalData?.cloud_provider])

  const onSubmit = methods.handleSubmit((data) => {
    const cloneData = data.features.filter((filter) => filter.id)
    setFeaturesData({
      features: cloneData,
    })
    // const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_APPLICATION_CREATION_URL}`
    // navigate(pathCreate + SERVICES_CREATION_RESOURCES_URL)
  })

  return (
    <FunnelFlowBody helpSection={funnelCardHelp}>
      <FormProvider {...methods}>
        <StepFeatures onSubmit={onSubmit} features={features} cloudProvider={generalData?.cloud_provider} />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepFeaturesFeature
