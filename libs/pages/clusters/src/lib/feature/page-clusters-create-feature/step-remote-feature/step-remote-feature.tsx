import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { type ClusterRemoteData } from '@qovery/shared/interfaces'
import { CLUSTERS_CREATION_SUMMARY_URL, CLUSTERS_CREATION_URL, CLUSTERS_URL } from '@qovery/shared/routes'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import StepRemote from '../../../ui/page-clusters-create/step-remote/step-remote'
import { steps, useClusterContainerCreateContext } from '../page-clusters-create-feature'

export function StepRemoteFeature() {
  useDocumentTitle('SSH Key - Create Cluster')
  const { remoteData, setRemoteData, setCurrentStep, generalData, resourcesData } = useClusterContainerCreateContext()
  const navigate = useNavigate()
  const { organizationId = '' } = useParams()

  useEffect(() => {
    setCurrentStep(steps(generalData, resourcesData?.cluster_type).findIndex((step) => step.key === 'remote') + 1)
  }, [setCurrentStep, generalData?.cloud_provider, generalData?.installation_type, resourcesData?.cluster_type])

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
    <FunnelFlowBody>
      <FormProvider {...methods}>
        <StepRemote onSubmit={onSubmit} />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepRemoteFeature
