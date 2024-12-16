import {
  type ApplicationEditRequest,
  type ContainerRequest,
  type Probe,
  type ProbeType,
  type ServicePort,
} from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { type Application, type Container } from '@qovery/domains/services/data-access'
import { useEditService, useService } from '@qovery/domains/services/feature'
import { ProbeTypeEnum } from '@qovery/shared/enums'
import { type PortData } from '@qovery/shared/interfaces'
import { ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { buildEditServicePayload } from '@qovery/shared/util-services'
import PageSettingsPorts from '../../ui/page-settings-ports/page-settings-ports'
import CrudModalFeature from './crud-modal-feature/crud-modal-feature'

export function removePortFromProbes(application: Application | Container, port?: number) {
  const cloneApplication = { ...application }

  const removePortFromProbe = (probe?: Probe | null): Probe | null | undefined => {
    let result = probe

    if (probe && probe.type) {
      const type: ProbeType = probe.type

      type &&
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

  cloneApplication.healthchecks = {
    liveness_probe: removePortFromProbe(cloneApplication.healthchecks?.liveness_probe),
    readiness_probe: removePortFromProbe(cloneApplication.healthchecks?.readiness_probe),
  }

  return cloneApplication
}

export const deletePort = (application: Application | Container, portId?: string) => {
  const cloneApplication = {
    ...removePortFromProbes(application, application.ports?.find((port) => port.id === portId)?.internal_port),
  }

  cloneApplication.ports = cloneApplication.ports?.filter((port) => port.id !== portId)
  return cloneApplication
}

export function SettingsPortsFeature({
  organizationId,
  projectId,
  service,
}: {
  organizationId: string
  projectId: string
  service: Application | Container
}) {
  const { mutate: editService } = useEditService({
    environmentId: service.environment?.id || '',
    logsLink:
      ENVIRONMENT_LOGS_URL(organizationId, projectId, service.environment?.id) + ENVIRONMENT_LOGS_URL(service.id),
  })

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  return (
    <PageSettingsPorts
      ports={service.ports}
      healthchecks={service.healthchecks}
      onAddPort={() => {
        openModal({
          content: <CrudModalFeature onClose={closeModal} service={service} />,
        })
      }}
      onEdit={(port: PortData | ServicePort) => {
        openModal({
          content: <CrudModalFeature onClose={closeModal} service={service} port={port as ServicePort} />,
        })
      }}
      onDelete={(port: PortData | ServicePort, warning) => {
        openModalConfirmation({
          title: 'Delete Port',
          isDelete: true,
          name: `Port: ${(port as PortData).application_port || (port as ServicePort).internal_port}`,
          warning,
          action: () => {
            const cloneApplication = deletePort(service, (port as ServicePort).id)
            const payload = match(service)
              .with({ serviceType: 'APPLICATION' }, (service) =>
                buildEditServicePayload({
                  service,
                  request: cloneApplication as ApplicationEditRequest,
                })
              )
              .with({ serviceType: 'CONTAINER' }, (service) =>
                buildEditServicePayload({
                  service,
                  request: cloneApplication as ContainerRequest,
                })
              )
              .otherwise(() => undefined)

            if (!payload) return

            editService({
              serviceId: service.id,
              payload,
            })
          },
        })
      }}
    />
  )
}

export function PageSettingsPortsFeature() {
  const { organizationId = '', projectId = '', applicationId = '', environmentId = '' } = useParams()
  const { data: service } = useService({ environmentId, serviceId: applicationId })

  return match(service)
    .with({ serviceType: 'APPLICATION' }, { serviceType: 'CONTAINER' }, (s) => (
      <SettingsPortsFeature organizationId={organizationId} projectId={projectId} service={s} />
    ))
    .otherwise(() => null)
}

export default PageSettingsPortsFeature
