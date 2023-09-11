import { type Probe, type ProbeType, type ServicePort } from 'qovery-typescript-axios'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { editApplication, postApplicationActionsRedeploy, selectApplicationById } from '@qovery/domains/application'
import { ProbeTypeEnum, getServiceType } from '@qovery/shared/enums'
import { type ApplicationEntity, type PortData } from '@qovery/shared/interfaces'
import { DEPLOYMENT_LOGS_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { type AppDispatch, type RootState } from '@qovery/state/store'
import PageSettingsPorts from '../../ui/page-settings-ports/page-settings-ports'
import CrudModalFeature from './crud-modal-feature/crud-modal-feature'

export function removePortFromProbes(application?: ApplicationEntity, port?: number): ApplicationEntity {
  const cloneApplication = { ...application } as ApplicationEntity

  const removePortFromProbe = (probe?: Probe): Probe | undefined => {
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

export const deletePort = (application?: ApplicationEntity, portId?: string) => {
  const cloneApplication = {
    ...removePortFromProbes(application, application?.ports?.find((port) => port.id === portId)?.internal_port),
  }

  cloneApplication.ports = cloneApplication.ports?.filter((port) => port.id !== portId)
  return cloneApplication
}

export function PageSettingsPortsFeature() {
  const dispatch = useDispatch<AppDispatch>()

  const { organizationId = '', projectId = '', applicationId = '', environmentId = '' } = useParams()

  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => selectApplicationById(state, applicationId),
    (a, b) => JSON.stringify(a?.ports) === JSON.stringify(b?.ports)
  )

  const navigate = useNavigate()
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  const toasterCallback = () => {
    if (application) {
      dispatch(
        postApplicationActionsRedeploy({
          applicationId: applicationId,
          environmentId: environmentId,
          serviceType: getServiceType(application),
          callback: () =>
            navigate(
              ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + DEPLOYMENT_LOGS_URL(applicationId)
            ),
        })
      )
    }
  }

  return (
    <PageSettingsPorts
      ports={application?.ports}
      healthchecks={application?.healthchecks}
      onAddPort={() => {
        openModal({
          content: (
            <CrudModalFeature
              onClose={closeModal}
              application={application}
              organizationId={organizationId}
              projectId={projectId}
            />
          ),
        })
      }}
      onEdit={(port: PortData | ServicePort) => {
        openModal({
          content: (
            <CrudModalFeature
              onClose={closeModal}
              application={application}
              port={port as ServicePort}
              organizationId={organizationId}
              projectId={projectId}
            />
          ),
        })
      }}
      onDelete={(port: PortData | ServicePort, warning) => {
        openModalConfirmation({
          title: 'Delete Port',
          isDelete: true,
          name: `Port: ${(port as PortData).application_port || (port as ServicePort).internal_port}`,
          warning,
          action: () => {
            if (application) {
              const cloneApplication = deletePort(application, (port as ServicePort).id)
              dispatch(
                editApplication({
                  applicationId: applicationId,
                  data: cloneApplication,
                  serviceType: getServiceType(application),
                  toasterCallback,
                })
              )
            }
          },
        })
      }}
    />
  )
}

export default PageSettingsPortsFeature
