import { createFileRoute, useParams } from '@tanstack/react-router'
import { type HelmPortRequestPortsInner } from 'qovery-typescript-axios'
import { HelmNetworkingSettings } from '@qovery/domains/service-settings/feature'
import { useEditService, useService } from '@qovery/domains/services/feature'
import { buildEditServicePayload } from '@qovery/shared/util-services'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/networking'
)({
  component: RouteComponent,
})

const HelmNetworkingSettingsContent = () => {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })
  const { data: service } = useService({ serviceId, serviceType: 'HELM', suspense: true })
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
          serviceId,
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
    <HelmNetworkingSettings
      helmId={serviceId}
      ports={service?.ports ?? []}
      onAddPort={onAddPort}
      onEditPort={onEditPort}
      onRemovePort={onRemovePort}
    />
  )
}

function RouteComponent() {
  return <HelmNetworkingSettingsContent />
}
