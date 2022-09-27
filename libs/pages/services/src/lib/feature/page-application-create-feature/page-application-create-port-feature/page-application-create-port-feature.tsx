import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import {
  SERVICES_APPLICATION_CREATION_URL,
  SERVICES_CREATION_GENERAL_URL,
  SERVICES_CREATION_INSTALLATION_URL,
  SERVICES_CREATION_RESOURCES_URL,
  SERVICES_URL,
} from '@qovery/shared/router'
import { FunnelFlowBody, FunnelFlowHelpCard } from '@qovery/shared/ui'
import PageApplicationCreatePort from '../../../ui/page-application-create/page-application-create-port/page-application-create-port'
import { PortData } from '../application-creation-flow.interface'
import { useApplicationContainerCreateContext } from '../page-application-create-feature'

export function PageApplicationCreatePortFeature() {
  const { setCurrentStep, portData, setPortData, generalData } = useApplicationContainerCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()

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

  const methods = useForm<PortData>({
    defaultValues: portData,
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit((data) => {
    setPortData(data)
    const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_APPLICATION_CREATION_URL}`
    navigate(pathCreate + SERVICES_CREATION_INSTALLATION_URL)
  })

  const onBack = () => {
    const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_APPLICATION_CREATION_URL}`
    navigate(pathCreate + SERVICES_CREATION_RESOURCES_URL)
  }

  const [ports, setPorts] = useState(methods.getValues().ports)

  const onAddPort = () => {
    const newPortRow = { application_port: undefined, external_port: 443, is_public: true }
    setPorts([...ports, newPortRow])
    methods.reset({
      ...methods.getValues(),
      ports: [...ports, newPortRow],
    })
  }

  const removePort = (index: number) => {
    const newPorts = [...ports]
    newPorts.splice(index, 1)
    setPorts(newPorts)
    methods.unregister(`ports.${index}`)
  }

  return (
    <FunnelFlowBody helpSection={funnelCardHelp}>
      <FormProvider {...methods}>
        <PageApplicationCreatePort
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

export default PageApplicationCreatePortFeature
