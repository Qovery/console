import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { FlowCreatePort } from '@qovery/shared/console-shared'
import { FlowPortData } from '@qovery/shared/interfaces'
import {
  SERVICES_APPLICATION_CREATION_URL,
  SERVICES_CREATION_GENERAL_URL,
  SERVICES_CREATION_POST_URL,
  SERVICES_CREATION_RESOURCES_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody, FunnelFlowHelpCard } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { useApplicationContainerCreateContext } from '../page-application-create-feature'

export function StepPortFeature() {
  useDocumentTitle('Ports - Create Application')
  const { setCurrentStep, portData, setPortData, generalData } = useApplicationContainerCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()
  const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_APPLICATION_CREATION_URL}`

  useEffect(() => {
    !generalData?.name &&
      navigate(
        `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_APPLICATION_CREATION_URL}` +
          SERVICES_CREATION_GENERAL_URL
      )
  }, [generalData, navigate, environmentId, organizationId, projectId])

  const funnelCardHelp = (
    <FunnelFlowHelpCard
      title="Configuring the application port"
      items={[
        'Declare the ports used internally by your application',
        'Declared ports are accessible from other applications within the same environment',
        'You can also expose them on the internet by making them public.',
        'Declared ports are also used to check the liveness/readiness of your application.',
      ]}
      helpSectionProps={{
        description: 'This is still a description',
        links: [
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#ports',
            linkLabel: 'How to configure my application',
            external: true,
          },
          { link: 'https://discuss.qovery.com/', linkLabel: 'Still need help? Ask on our Forum', external: true },
        ],
      }}
    />
  )

  useEffect(() => {
    setCurrentStep(3)
  }, [setCurrentStep])

  const methods = useForm<FlowPortData>({
    defaultValues: portData,
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit((data) => {
    setPortData(data)
    navigate(pathCreate + SERVICES_CREATION_POST_URL)
  })

  const onBack = () => {
    navigate(pathCreate + SERVICES_CREATION_RESOURCES_URL)
  }

  const [ports, setPorts] = useState(methods.getValues().ports)

  const onAddPort = () => {
    const newPortRow = { application_port: undefined, external_port: 443, is_public: true }
    if (ports.length) {
      setPorts([...ports, newPortRow])
      methods.setValue(`ports.${ports.length}`, newPortRow)
    } else {
      setPorts([newPortRow])
      methods.setValue(`ports.0`, newPortRow)
    }
  }

  const removePort = (index: number) => {
    const newPorts = methods.getValues().ports
    newPorts.splice(index, 1)
    setPorts(newPorts)
    methods.reset({ ports: newPorts })
  }

  return (
    <FunnelFlowBody helpSection={funnelCardHelp}>
      <FormProvider {...methods}>
        <FlowCreatePort
          onBack={onBack}
          onSubmit={onSubmit}
          onAddPort={onAddPort}
          onRemovePort={removePort}
          ports={ports}
        />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepPortFeature
