import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { type ClusterKubeconfigData } from '@qovery/shared/interfaces'
import { CLUSTERS_CREATION_SUMMARY_URL, CLUSTERS_CREATION_URL, CLUSTERS_URL } from '@qovery/shared/routes'
import { FunnelFlowBody, FunnelFlowHelpCard } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { StepKubeconfig } from '../../../ui/page-clusters-create/step-kubeconfig/step-kubeconfig'
import { useClusterContainerCreateContext } from '../page-clusters-create-feature'

export function StepKubeconfigFeature() {
  useDocumentTitle('Kubeconfig - Create Cluster')
  const { setKubeconfigData, kubeconfigData, setCurrentStep } = useClusterContainerCreateContext()
  const navigate = useNavigate()
  const { organizationId = '' } = useParams()
  const methods = useForm<ClusterKubeconfigData>({
    defaultValues: kubeconfigData,
    mode: 'onChange',
  })

  const funnelCardHelp = (
    <FunnelFlowHelpCard
      title="Kubeconfig"
      items={[
        'A Kubeconfig file is necessary to access your Kubernetes cluster and manage the deployment of your resources.',
        'The file is securely stored within the Qovery infrastructure.',
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

  useEffect(() => {
    setCurrentStep(2)
  }, [setCurrentStep])

  const onSubmit = methods.handleSubmit((data) => {
    setKubeconfigData(data)

    const pathCreate = `${CLUSTERS_URL(organizationId)}${CLUSTERS_CREATION_URL}`
    navigate(pathCreate + CLUSTERS_CREATION_SUMMARY_URL)
  })

  return (
    <FunnelFlowBody helpSection={funnelCardHelp}>
      <FormProvider {...methods}>
        <StepKubeconfig onSubmit={onSubmit} />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepKubeconfigFeature
