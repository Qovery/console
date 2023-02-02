import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCloudProvider, getClusterState } from '@qovery/domains/organization'
import { ClusterGeneralData } from '@qovery/shared/interfaces'
import { FunnelFlowBody, FunnelFlowHelpCard } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import StepFeatures from '../../../ui/page-clusters-create/step-features/step-features'
import { useClusterContainerCreateContext } from '../page-clusters-create-feature'

export function StepFeaturesFeature() {
  useDocumentTitle('Features - Create Cluster')
  const { setGeneralData, generalData, setCurrentStep } = useClusterContainerCreateContext()
  const dispatch = useDispatch<AppDispatch>()
  const cloudProvider = useSelector((state: RootState) => getClusterState(state).cloudProvider)

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

  const methods = useForm<ClusterGeneralData>({
    defaultValues: generalData,
    mode: 'onChange',
  })

  useEffect(() => {
    if (cloudProvider.loadingStatus !== 'loaded') dispatch(fetchCloudProvider())
  }, [cloudProvider.loadingStatus, dispatch, methods])

  const onSubmit = methods.handleSubmit((data) => {
    setGeneralData(data)
    // const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_APPLICATION_CREATION_URL}`
    // navigate(pathCreate + SERVICES_CREATION_RESOURCES_URL)
  })

  return (
    <FunnelFlowBody helpSection={funnelCardHelp}>
      <FormProvider {...methods}>
        <StepFeatures onSubmit={onSubmit} cloudProviders={cloudProvider.items} />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepFeaturesFeature
