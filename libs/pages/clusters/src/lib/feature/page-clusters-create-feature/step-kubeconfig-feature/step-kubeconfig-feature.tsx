import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { type ClusterKubeconfigData } from '@qovery/shared/interfaces'
import { CLUSTERS_CREATION_SUMMARY_URL } from '@qovery/shared/routes'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { StepKubeconfig } from '../../../ui/page-clusters-create/step-kubeconfig/step-kubeconfig'
import { useClusterContainerCreateContext } from '../page-clusters-create-feature'

export function StepKubeconfigFeature() {
  useDocumentTitle('Kubeconfig - Create Cluster')
  const { setKubeconfigData, kubeconfigData, setCurrentStep, creationFlowUrl } = useClusterContainerCreateContext()
  const navigate = useNavigate()
  const methods = useForm<ClusterKubeconfigData>({
    defaultValues: kubeconfigData,
    mode: 'onChange',
  })

  useEffect(() => {
    setCurrentStep(2)
  }, [setCurrentStep])

  const onSubmit = methods.handleSubmit((data) => {
    setKubeconfigData(data)

    navigate(creationFlowUrl + CLUSTERS_CREATION_SUMMARY_URL)
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
