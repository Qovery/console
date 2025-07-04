import { type HelmPortRequestPortsInner } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { NetworkingSetting } from '@qovery/domains/service-helm/feature'
import { useEditService, useService } from '@qovery/domains/services/feature'
import { buildEditServicePayload } from '@qovery/shared/util-services'

interface HelmNetworkingData {
  ports: HelmPortRequestPortsInner[]
}

export function PageSettingsNetworkingFeature() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()
  const { data: service } = useService({ serviceId: applicationId, serviceType: 'HELM' })
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
        serviceId: applicationId,
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
    <div className="flex w-full max-w-content-with-navigation-left flex-col justify-between p-8">
      <FormProvider {...methods}>
        <NetworkingSetting
          helmId={applicationId}
          ports={ports}
          onUpdatePorts={(updatedPorts) => {
            methods.setValue('ports', updatedPorts)
            onSubmit()
          }}
          isSetting
        />
      </FormProvider>
    </div>
  )
}

export default PageSettingsNetworkingFeature
