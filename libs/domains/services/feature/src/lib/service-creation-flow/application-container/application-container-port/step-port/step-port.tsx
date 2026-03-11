import { useParams } from '@tanstack/react-router'
import { useEffect } from 'react'
import { FormProvider } from 'react-hook-form'
import {
  type ApplicationGeneralData,
  type ApplicationResourcesData,
  type FlowPortData,
  type PortData,
} from '@qovery/shared/interfaces'
import { FunnelFlowBody, useModal } from '@qovery/shared/ui'
import { useApplicationContainerCreateContext } from '../../application-container-creation-flow'
import { ApplicationContainerPortList } from '../application-container-port-list/application-container-port-list'
import { ApplicationContainerPortModal } from '../application-container-port-modal/application-container-port-modal'

export interface ApplicationContainerStepPortSubmitData {
  generalData: ApplicationGeneralData
  resourcesData: ApplicationResourcesData
  portData: FlowPortData
}

export interface ApplicationContainerStepPortProps {
  onBack: () => void
  onSubmit: (data: ApplicationContainerStepPortSubmitData) => void | Promise<void>
  loading?: boolean
}

export function ApplicationContainerStepPort({ onBack, onSubmit, loading = false }: ApplicationContainerStepPortProps) {
  const { portForm, generalForm, resourcesForm, setCurrentStep } = useApplicationContainerCreateContext()
  const { environmentId = '' } = useParams({ strict: false })
  const { openModal, closeModal } = useModal()

  useEffect(() => {
    setCurrentStep(3)
  }, [setCurrentStep])

  const methods = portForm

  const ports = methods.watch('ports') ?? []
  const healthchecks = methods.watch('healthchecks')

  const openPortModal = (port?: PortData) => {
    openModal({
      content: (
        <ApplicationContainerPortModal
          onClose={closeModal}
          port={port}
          portData={methods.getValues()}
          setPortData={(data) => methods.reset(data)}
          environmentId={environmentId}
          hidePortName
        />
      ),
    })
  }

  const removePort = (port: PortData) => {
    methods.setValue(
      'ports',
      (ports ?? []).filter((currentPort) => currentPort.application_port !== port.application_port),
      {
        shouldDirty: true,
      }
    )
  }

  const submitPortForm = methods.handleSubmit((portData) => {
    onSubmit({
      generalData: generalForm.getValues(),
      resourcesData: resourcesForm.getValues(),
      portData,
    })
  })

  return (
    <FunnelFlowBody>
      <FormProvider {...methods}>
        <form onSubmit={submitPortForm}>
          <ApplicationContainerPortList
            ports={ports}
            livenessProbeType={healthchecks?.item?.liveness_probe?.type}
            readinessProbeType={healthchecks?.item?.readiness_probe?.type}
            onAddPort={() => openPortModal()}
            onEditPort={(port) => openPortModal(port)}
            onRemovePort={removePort}
            onBack={onBack}
            onSubmit={() => submitPortForm()}
            loading={loading}
            hidePortName
          />
        </form>
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default ApplicationContainerStepPort
