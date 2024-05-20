import { type ServicePort } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FlowCreatePort } from '@qovery/shared/console-shared'
import { type PortData } from '@qovery/shared/interfaces'
import {
  SERVICES_CREATION_GENERAL_URL,
  SERVICES_CREATION_HEALTHCHECKS_URL,
  SERVICES_CREATION_POST_URL,
  SERVICES_CREATION_RESOURCES_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody, useModal } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useApplicationContainerCreateContext } from '../page-application-create-feature'
import CrudModalFeature from './crud-modal-feature/crud-modal-feature'

export function StepPortFeature() {
  useDocumentTitle('Ports - Create Application')
  const { setCurrentStep, portData, setPortData, generalData, serviceURL } = useApplicationContainerCreateContext()
  const { openModal, closeModal } = useModal()

  const { environmentId = '' } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    !generalData?.name && navigate(serviceURL + SERVICES_CREATION_GENERAL_URL)
  }, [generalData, navigate, serviceURL])

  useEffect(() => {
    setCurrentStep(3)
  }, [setCurrentStep])

  const onSubmit = () => {
    if (portData?.ports && portData.ports.length > 0) {
      navigate(serviceURL + SERVICES_CREATION_HEALTHCHECKS_URL)
    } else {
      navigate(serviceURL + SERVICES_CREATION_POST_URL)
    }
  }

  const onBack = () => {
    navigate(serviceURL + SERVICES_CREATION_RESOURCES_URL)
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
