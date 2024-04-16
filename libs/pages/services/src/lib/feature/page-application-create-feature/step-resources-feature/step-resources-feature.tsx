import { KubernetesEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useCluster } from '@qovery/domains/clusters/feature'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { type ApplicationResourcesData } from '@qovery/shared/interfaces'
import {
  SERVICES_APPLICATION_CREATION_URL,
  SERVICES_CREATION_GENERAL_URL,
  SERVICES_CREATION_PORTS_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import StepResources from '../../../ui/page-application-create/step-resources/step-resources'
import { useApplicationContainerCreateContext } from '../page-application-create-feature'

export function StepResourcesFeature() {
  useDocumentTitle('Resources - Create Application')
  const { setCurrentStep, resourcesData, setResourcesData, generalData } = useApplicationContainerCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()
  const [maxInstances, setMaxInstance] = useState(1000)

  const { data: environment } = useEnvironment({ environmentId })

  const { data: cluster } = useCluster({ organizationId, clusterId: environment?.cluster_id ?? '' })

  useEffect(() => {
    !generalData?.name &&
      navigate(
        `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_APPLICATION_CREATION_URL}` +
          SERVICES_CREATION_GENERAL_URL
      )
  }, [generalData, navigate, environmentId, organizationId, projectId])

  useEffect(() => {
    setCurrentStep(2)
  }, [setCurrentStep])

  const methods = useForm<ApplicationResourcesData>({
    defaultValues: resourcesData,
    mode: 'onChange',
  })

  useEffect(() => {
    if (cluster?.kubernetes === KubernetesEnum.K3_S) {
      setMaxInstance(1)
      methods.setValue('min_running_instances', 1)
      methods.setValue('max_running_instances', 1)
    }
  }, [methods, cluster])

  const onSubmit = methods.handleSubmit((data) => {
    setResourcesData(data)
    const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_APPLICATION_CREATION_URL}`
    navigate(pathCreate + SERVICES_CREATION_PORTS_URL)
  })

  const onBack = () => {
    const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_APPLICATION_CREATION_URL}`
    navigate(pathCreate + SERVICES_CREATION_GENERAL_URL)
  }

  return (
    <FunnelFlowBody>
      <FormProvider {...methods}>
        <StepResources maximumInstances={maxInstances} onBack={onBack} onSubmit={onSubmit} />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepResourcesFeature
