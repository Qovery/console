import { type HelmPortRequestPortsInner } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { HelmNetworkingSettings } from '@qovery/domains/service-settings/feature'
import { useEditService, useService } from '@qovery/domains/services/feature'
import { buildEditServicePayload } from '@qovery/shared/util-services'

export function PageSettingsNetworkingFeature() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()
  const { data: service } = useService({ serviceId: applicationId, serviceType: 'HELM' })
  const { mutate: editService } = useEditService({
    organizationId,
    projectId,
    environmentId,
  })

  const updatePorts = (ports: HelmPortRequestPortsInner[]) =>
    new Promise<void>((resolve, reject) => {
      if (!service) {
        resolve()
        return
      }

      editService(
        {
          serviceId: applicationId,
          payload: buildEditServicePayload({ service, request: { ports } }),
        },
        {
          onSuccess: () => resolve(),
          onError: () => reject(),
        }
      )
    })

  const onAddPort = async (port: HelmPortRequestPortsInner) => {
    await updatePorts([...(service?.ports ?? []), port])
  }

  const onEditPort = async (originalPort: HelmPortRequestPortsInner, updatedPort: HelmPortRequestPortsInner) => {
    await updatePorts([...(service?.ports ?? []).filter((port) => port !== originalPort), updatedPort])
  }

  const onRemovePort = async (portToRemove: HelmPortRequestPortsInner) => {
    await updatePorts([...(service?.ports ?? []).filter((port) => port !== portToRemove)])
  }

  return (
    <div className="flex w-full max-w-content-with-navigation-left flex-col justify-between p-8">
      <HelmNetworkingSettings
        helmId={applicationId}
        ports={service?.ports ?? []}
        onAddPort={onAddPort}
        onEditPort={onEditPort}
        onRemovePort={onRemovePort}
      />
    </div>
  )
}

export default PageSettingsNetworkingFeature
