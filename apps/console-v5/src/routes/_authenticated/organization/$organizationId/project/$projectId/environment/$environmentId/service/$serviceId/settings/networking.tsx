import { createFileRoute, useParams } from '@tanstack/react-router'
import { type HelmPortRequestPortsInner } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import { HelmNetworkingSettings } from '@qovery/domains/service-settings/feature'
import { useEditService, useService } from '@qovery/domains/services/feature'
import { buildEditServicePayload } from '@qovery/shared/util-services'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/networking'
)({
  component: RouteComponent,
})

interface HelmNetworkingData {
  ports: HelmPortRequestPortsInner[]
}

const HelmNetworkingSettingsContent = () => {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })
  const { data: service } = useService({ serviceId, serviceType: 'HELM', suspense: true })
  const { mutate: editService } = useEditService({
    organizationId,
    projectId,
    environmentId,
  })

  const methods = useForm<HelmNetworkingData>({
    mode: 'onChange',
    defaultValues: {
      ports: service?.ports ?? [],
    },
  })
  const ports = methods.watch('ports')
  const onSubmit = methods.handleSubmit((data) => {
    if (!service) {
      return
    }

    editService(
      {
        serviceId,
        payload: buildEditServicePayload({ service, request: data }),
      },
      {
        onError: () => {
          methods.setValue('ports', service?.ports ?? [])
        },
      }
    )
  })

  return (
    <FormProvider {...methods}>
      <HelmNetworkingSettings
        helmId={serviceId}
        ports={ports}
        onUpdatePorts={(updatedPorts) => {
          methods.setValue('ports', updatedPorts)
          onSubmit()
        }}
      />
    </FormProvider>
  )
}

function RouteComponent() {
  return <HelmNetworkingSettingsContent />
}
