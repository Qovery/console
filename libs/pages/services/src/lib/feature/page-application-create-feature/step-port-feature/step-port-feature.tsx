import { type ServicePort } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FlowCreatePort } from '@qovery/shared/console-shared'
import { type PortData } from '@qovery/shared/interfaces'
import {
  SERVICES_APPLICATION_CREATION_URL,
  SERVICES_CREATION_GENERAL_URL,
  SERVICES_CREATION_HEALTHCHECKS_URL,
  SERVICES_CREATION_POST_URL,
  SERVICES_CREATION_RESOURCES_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody, useModal } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
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
    <FunnelFlowBody>
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
