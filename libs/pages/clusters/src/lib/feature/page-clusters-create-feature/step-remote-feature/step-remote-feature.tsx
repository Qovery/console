import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { ClusterRemoteData } from '@qovery/shared/interfaces'
import { CLUSTERS_CREATION_SUMMARY_URL, CLUSTERS_CREATION_URL, CLUSTERS_URL } from '@qovery/shared/routes'
import { FunnelFlowBody, FunnelFlowHelpCard } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import StepRemote from '../../../ui/page-clusters-create/step-remote/step-remote'
import { steps, useClusterContainerCreateContext } from '../page-clusters-create-feature'

export function StepRemoteFeature() {
  useDocumentTitle('SSH Key - Create Cluster')
  const { remoteData, setRemoteData, setCurrentStep, generalData, resourcesData } = useClusterContainerCreateContext()
  const navigate = useNavigate()
  const { organizationId = '' } = useParams()

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
    setCurrentStep(
      steps(generalData?.cloud_provider, resourcesData?.cluster_type).findIndex((step) => step.key === 'remote') + 1
    )
  }, [setCurrentStep, generalData?.cloud_provider, resourcesData?.cluster_type])

  const methods = useForm<ClusterRemoteData>({
    defaultValues: remoteData,
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit((data) => {
    setRemoteData(data)
    const pathCreate = `${CLUSTERS_URL(organizationId)}${CLUSTERS_CREATION_URL}`
    navigate(pathCreate + CLUSTERS_CREATION_SUMMARY_URL)
  })

  return (
    <FunnelFlowBody helpSection={funnelCardHelp}>
      <FormProvider {...methods}>
        <StepRemote onSubmit={onSubmit} />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepRemoteFeature
