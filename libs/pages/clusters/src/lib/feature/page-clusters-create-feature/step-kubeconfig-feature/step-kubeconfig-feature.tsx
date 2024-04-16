import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { type ClusterKubeconfigData } from '@qovery/shared/interfaces'
import { CLUSTERS_CREATION_SUMMARY_URL, CLUSTERS_CREATION_URL, CLUSTERS_URL } from '@qovery/shared/routes'
import { FunnelFlowBody } from '@qovery/shared/ui'
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

  useEffect(() => {
    setCurrentStep(2)
  }, [setCurrentStep])

  const onSubmit = methods.handleSubmit((data) => {
    setKubeconfigData(data)

    const pathCreate = `${CLUSTERS_URL(organizationId)}${CLUSTERS_CREATION_URL}`
    navigate(pathCreate + CLUSTERS_CREATION_SUMMARY_URL)
  })

  return (
    <FunnelFlowBody>
      <FormProvider {...methods}>
        <StepKubeconfig onSubmit={onSubmit} />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepKubeconfigFeature
