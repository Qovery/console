import { ClusterFeature } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchClusterFeatures } from '@qovery/domains/organization'
import { ClusterFeaturesData } from '@qovery/shared/interfaces'
import { CLUSTERS_CREATION_SUMMARY_URL, CLUSTERS_CREATION_URL, CLUSTERS_URL } from '@qovery/shared/routes'
import { FunnelFlowBody, FunnelFlowHelpCard } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch } from '@qovery/store'
import StepFeatures from '../../../ui/page-clusters-create/step-features/step-features'
import { useClusterContainerCreateContext } from '../page-clusters-create-feature'

export function StepFeaturesFeature() {
  useDocumentTitle('Features - Create Cluster')
  const { organizationId = '' } = useParams()
  const { setFeaturesData, generalData, featuresData, setCurrentStep } = useClusterContainerCreateContext()
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
            external: true,
          },
          { link: 'https://discuss.qovery.com/', linkLabel: 'Still need help? Ask on our Forum', external: true },
        ],
      }}
    />
  )

  useEffect(() => {
    setCurrentStep(4)
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
    if (data.features) {
      const cloneData = data.features.filter((filter) => filter.id)
      setFeaturesData({
        features: cloneData,
      })
    }
    const pathCreate = `${CLUSTERS_URL(organizationId)}${CLUSTERS_CREATION_URL}`
    navigate(pathCreate + CLUSTERS_CREATION_SUMMARY_URL)
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
