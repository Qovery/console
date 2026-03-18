import { useParams } from '@tanstack/react-router'
import {
  type ApplicationEditRequest,
  type ContainerRequest,
  type Probe,
  type ProbeType,
  type ServicePort,
  type ServiceTypeEnum,
} from 'qovery-typescript-axios'
import { Suspense } from 'react'
import { match } from 'ts-pattern'
import { useCustomDomains } from '@qovery/domains/custom-domains/feature'
import { type Application, type Container } from '@qovery/domains/services/data-access'
import { useEditService, useService } from '@qovery/domains/services/feature'
import { ProbeTypeEnum } from '@qovery/shared/enums'
import { LoaderSpinner, Section, useModal, useModalConfirmation, useModalMultiConfirmation } from '@qovery/shared/ui'
import { buildEditServicePayload, isTryingToRemoveLastPublicPort } from '@qovery/shared/util-services'
import { ApplicationContainerPortSettingsModal } from '../application-container-port-crud-modal/application-container-port-crud-modal'
import { ApplicationContainerPortSettingsList } from './application-container-port-settings-list'

const PortSettingsFallback = () => (
  <div className="flex min-h-page-container items-center justify-center">
    <LoaderSpinner />
  </div>
)

export function removePortFromProbes<T extends Application | Container>(service: T, port?: number): T {
  const cloneService = { ...service }

  const removePortFromProbe = (probe?: Probe | null): Probe | null | undefined => {
    let result = probe

    if (probe && probe.type) {
      const type: ProbeType = probe.type

      Object.keys(type).forEach((key) => {
        const subType = type[key as keyof ProbeType]

        if (typeof subType === 'object') {
          if (
            key === ProbeTypeEnum.TCP.toLowerCase() ||
            key === ProbeTypeEnum.HTTP.toLowerCase() ||
            key === ProbeTypeEnum.GRPC.toLowerCase()
          ) {
            const portValue = (subType as { port?: number })?.port

            if (portValue === port) {
              result = undefined
            }
          }
        }
      })
    }

    return result
  }

  cloneService.healthchecks = {
    ...cloneService.healthchecks,
    liveness_probe: removePortFromProbe(cloneService.healthchecks?.liveness_probe),
    readiness_probe: removePortFromProbe(cloneService.healthchecks?.readiness_probe),
  }

  return cloneService
}

export function deleteApplicationContainerPort<T extends Application | Container>(service: T, portId?: string): T {
  const cloneService = {
    ...removePortFromProbes(service, service.ports?.find((port) => port.id === portId)?.internal_port),
  }

  cloneService.ports = cloneService.ports?.filter((port) => port.id !== portId)

  return cloneService
}

export function ApplicationContainerPortSettings() {
  return (
    <Suspense fallback={<PortSettingsFallback />}>
      <ApplicationContainerPortSettingsContent />
    </Suspense>
  )
}

function ApplicationContainerPortSettingsContent() {
  const {
    organizationId = '',
    projectId = '',
    environmentId = '',
    serviceId = '',
  } = useParams({
    strict: false,
  })

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const { openModalMultiConfirmation } = useModalMultiConfirmation()

  const { data: service } = useService({ environmentId, serviceId, suspense: true })
  const { data: customDomains } = useCustomDomains({
    serviceId,
    serviceType: service?.serviceType ?? 'APPLICATION',
  })
  const { mutate: editService } = useEditService({
    organizationId,
    projectId,
    environmentId,
  })

  if (!service) {
    return null
  }

  return match(service)
    .with({ serviceType: 'APPLICATION' }, { serviceType: 'CONTAINER' }, (service) => {
      const openPortModal = (port?: ServicePort) => {
        openModal({
          content: (
            <ApplicationContainerPortSettingsModal
              service={service}
              organizationId={organizationId}
              projectId={projectId}
              environmentId={environmentId}
              port={port}
              onClose={closeModal}
            />
          ),
          options: {
            width: 680,
          },
        })
      }

      const onDeletePort = (port: ServicePort, warning?: string) => {
        const isTryingToRemoveLastPort = isTryingToRemoveLastPublicPort(
          service.serviceType as ServiceTypeEnum,
          service.ports,
          port,
          customDomains
        )

        const callback = () => {
          const cloneService = deleteApplicationContainerPort(service, port.id)
          const payload = match(service)
            .with({ serviceType: 'APPLICATION' }, (application) =>
              buildEditServicePayload({
                service: application,
                request: cloneService as ApplicationEditRequest,
              })
            )
            .with({ serviceType: 'CONTAINER' }, (container) =>
              buildEditServicePayload({
                service: container,
                request: cloneService as ContainerRequest,
              })
            )
            .exhaustive()

          editService({
            serviceId: service.id,
            payload,
          })
        }

        if (isTryingToRemoveLastPort) {
          openModalMultiConfirmation({
            title: 'Delete port',
            isDelete: true,
            description: 'Please confirm deletion',
            warning: (
              <p>
                You are about to remove your last public port.
                <br />
                Please confirm that you understand the impact of this operation.
              </p>
            ),
            checks: ['I understand this action is irreversible and will delete all linked domains'],
            action: callback,
          })
          return
        }

        openModalConfirmation({
          title: 'Delete port',
          confirmationMethod: 'action',
          name: `Port: ${port.internal_port}`,
          warning,
          action: callback,
        })
      }

      return (
        <Section className="px-8 pb-8 pt-6">
          <ApplicationContainerPortSettingsList
            ports={service.ports}
            livenessProbeType={service.healthchecks?.liveness_probe?.type}
            readinessProbeType={service.healthchecks?.readiness_probe?.type}
            onAddPort={() => openPortModal()}
            onEditPort={(port) => openPortModal(port)}
            onRemovePort={onDeletePort}
          />
        </Section>
      )
    })
    .otherwise(() => null)
}

export default ApplicationContainerPortSettings
