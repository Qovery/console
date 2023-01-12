import { KubernetesEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { selectEnvironmentById } from '@qovery/domains/environment'
import { selectClusterById } from '@qovery/domains/organization'
import { ApplicationResourcesData, ClusterEntity, EnvironmentEntity } from '@qovery/shared/interfaces'
import {
  SERVICES_APPLICATION_CREATION_URL,
  SERVICES_CREATION_GENERAL_URL,
  SERVICES_CREATION_PORTS_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody, FunnelFlowHelpCard } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { RootState } from '@qovery/store'
import StepResources from '../../../ui/page-application-create/step-resources/step-resources'
import { useApplicationContainerCreateContext } from '../page-application-create-feature'

export function StepResourcesFeature() {
  useDocumentTitle('Resources - Create Application')
  const { setCurrentStep, resourcesData, setResourcesData, generalData } = useApplicationContainerCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()
  const [maxInstances, setMaxInstance] = useState(50)

  const environment = useSelector<RootState, EnvironmentEntity | undefined>((state) =>
    selectEnvironmentById(state, environmentId)
  )
  const cluster = useSelector<RootState, ClusterEntity | undefined>((state) =>
    selectClusterById(state, environment?.cluster_id || '')
  )

  useEffect(() => {
    !generalData?.name &&
      navigate(
        `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_APPLICATION_CREATION_URL}` +
          SERVICES_CREATION_GENERAL_URL
      )
  }, [generalData, navigate, environmentId, organizationId, projectId])

  const funnelCardHelp = (
    <FunnelFlowHelpCard
      title="Setting the right resources"
      items={[
        'Application are deployed as containers on your Kubernetes cluster',
        'Set the vCPU/RAM based on your application need',
        'You can’t go beyond the resources available on your cluster',
        'To avoid application downtime in case of issue, set the minimum number of instances to at least 2',
      ]}
      helpSectionProps={{
        description: 'Need help? You may find these links useful',
        links: [
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#resources',
            linkLabel: 'How to configure my application',
            external: true,
          },
          { link: 'https://discuss.qovery.com/', linkLabel: 'Still need help? Ask on our Forum', external: true },
        ],
      }}
    />
  )

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
      methods.setValue('instances', [1, 1])
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
    <FunnelFlowBody helpSection={funnelCardHelp}>
      <FormProvider {...methods}>
        <StepResources maximumInstances={maxInstances} onBack={onBack} onSubmit={onSubmit} />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepResourcesFeature
