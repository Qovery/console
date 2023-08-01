import { ServicePort } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FlowCreatePort } from '@qovery/shared/console-shared'
import { PortData } from '@qovery/shared/interfaces'
import {
  SERVICES_APPLICATION_CREATION_URL,
  SERVICES_CREATION_GENERAL_URL,
  SERVICES_CREATION_HEALTHCHECKS_URL,
  SERVICES_CREATION_POST_URL,
  SERVICES_CREATION_RESOURCES_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody, FunnelFlowHelpCard, useModal } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { useApplicationContainerCreateContext } from '../page-application-create-feature'
import CrudModalFeature from './crud-modal-feature/crud-modal-feature'

export function StepPortFeature() {
  useDocumentTitle('Ports - Create Application')
  const { setCurrentStep, portData, setPortData, generalData } = useApplicationContainerCreateContext()
  const { openModal, closeModal } = useModal()

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
        description: 'Need help? You may find these links useful',
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

  const onSubmit = () => {
    if (portData?.ports && portData.ports.length > 0) {
      navigate(pathCreate + SERVICES_CREATION_HEALTHCHECKS_URL)
    } else {
      navigate(pathCreate + SERVICES_CREATION_POST_URL)
    }
  }

  const onBack = () => {
    navigate(pathCreate + SERVICES_CREATION_RESOURCES_URL)
  }

  const removePort = (data: PortData | ServicePort) => {
    setPortData({
      ports: portData?.ports?.filter((port) => port.application_port !== (data as PortData).application_port),
      healthchecks: portData?.healthchecks,
    })
  }

  return (
    <FunnelFlowBody helpSection={funnelCardHelp}>
      <FlowCreatePort
        onBack={onBack}
        onEdit={(port: PortData | ServicePort) => {
          openModal({
            content: (
              <CrudModalFeature
                onClose={closeModal}
                port={port}
                portData={portData}
                setPortData={setPortData}
                projectId={projectId}
                environmentId={environmentId}
              />
            ),
          })
        }}
        onAddPort={() => {
          openModal({
            content: (
              <CrudModalFeature
                onClose={closeModal}
                portData={portData}
                setPortData={setPortData}
                projectId={projectId}
                environmentId={environmentId}
              />
            ),
          })
        }}
        onRemovePort={removePort}
        ports={portData?.ports}
        onSubmit={onSubmit}
      />
    </FunnelFlowBody>
  )
}

export default StepPortFeature
