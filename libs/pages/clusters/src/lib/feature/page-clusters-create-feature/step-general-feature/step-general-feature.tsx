import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { ApplicationGeneralData } from '@qovery/shared/interfaces'
import { FunnelFlowBody, FunnelFlowHelpCard } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import StepGeneral from '../../../ui/page-clusters-create/step-general/step-general'
import { useClusterContainerCreateContext } from '../page-clusters-create-feature'

export function StepGeneralFeature() {
  useDocumentTitle('General - Create Cluster')
  const { setGeneralData, generalData, setCurrentStep } = useClusterContainerCreateContext()

  const funnelCardHelp = (
    <FunnelFlowHelpCard
      title="Cluster"
      items={[
        'A Kubernetes cluster is necessary to run your application and the Qovery services',
        'Since it runs on your cloud provider account, credentials are necessary to create and manage the cluster and the applications that will run on it',
        'The production flag allows to easily identify if you are running your production environment on this cluster',
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

  const methods = useForm<ApplicationGeneralData>({
    defaultValues: generalData,
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit((data) => {
    const cloneData = {
      ...data,
    }

    setGeneralData(cloneData)
    // const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_APPLICATION_CREATION_URL}`
    // navigate(pathCreate + SERVICES_CREATION_RESOURCES_URL)
  })

  return (
    <FunnelFlowBody helpSection={funnelCardHelp}>
      <FormProvider {...methods}>
        <StepGeneral onSubmit={onSubmit} />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepGeneralFeature
