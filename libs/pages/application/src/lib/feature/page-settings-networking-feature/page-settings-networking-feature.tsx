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
  const { environmentId = '', applicationId = '' } = useParams()
  const { data: service } = useService({ serviceId: applicationId, serviceType: 'HELM' })
  const { mutate: editService } = useEditService({ environmentId })

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

    editService({
      serviceId: applicationId,
      payload: buildEditServicePayload({ service, request: data }),
    })
  })

  return (
    <div className="flex flex-col justify-between w-full p-8 max-w-content-with-navigation-left">
      <FormProvider {...methods}>
        <NetworkingSetting
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
