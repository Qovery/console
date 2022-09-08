import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import {
  SERVICES_APPLICATION_CREATION_URL,
  SERVICES_CREATION_INSTALLATION_URL,
  SERVICES_CREATION_RESOURCES_URL,
  SERVICES_URL,
} from '@qovery/shared/router'
import { FunnelFlowBody, FunnelFlowHelpCard } from '@qovery/shared/ui'
import PageApplicationCreatePort from '../../../ui/page-application-create/page-application-create-port/page-application-create-port'
import { PortData } from '../application-creation-flow.interface'
import { useApplicationContainerCreateContext } from '../page-application-create-feature'

export function PageApplicationCreatePortFeature() {
  const { setCurrentStep, portData, setPortData } = useApplicationContainerCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()

  const funnelCardHelp = (
    <FunnelFlowHelpCard
      title="Step 3 is the cherry on the cake"
      items={['because ports is luxuous', 'and we do it with for free']}
      helpSectionProps={{
        description: 'This is still a description',
        links: [{ link: '#', linkLabel: 'link', external: true }],
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
    setPorts([...ports, { application_port: undefined, external_port: undefined, is_public: false }])
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
