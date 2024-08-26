import { type CloudProviderEnum, PortProtocolEnum, type ServicePort } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { CrudModal } from '@qovery/shared/console-shared'
import { type FlowPortData, type PortData } from '@qovery/shared/interfaces'
import { ToastEnum, toast, useModal } from '@qovery/shared/ui'

export interface CrudModalFeatureProps {
  environmentId: string
  onClose: () => void
  port?: PortData | ServicePort
  portData?: FlowPortData
  setPortData?: (portData: FlowPortData) => void
  hidePortName?: boolean
}

export function CrudModalFeature({
  port,
  portData,
  setPortData,
  onClose,
  environmentId,
  hidePortName,
}: CrudModalFeatureProps) {
  const [loading, setLoading] = useState(false)
  const { enableAlertClickOutside } = useModal()
  const { data: environment } = useEnvironment({ environmentId })

  const methods = useForm({
    defaultValues: {
      internal_port: port ? (port as PortData).application_port : undefined,
      external_port: port ? port.external_port : undefined,
      publicly_accessible: port ? (port as PortData).is_public : false,
      protocol: port ? port.protocol : PortProtocolEnum.HTTP,
      name: port ? port.name : '',
    },
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit((data) => {
    setLoading(true)

    const newPortRow = {
      application_port: data['internal_port'] || undefined,
      external_port: data['external_port'] || undefined,
      is_public: data['publicly_accessible'] || false,
      protocol: data['protocol'] || PortProtocolEnum.HTTP,
      name: data['name'] || `p${data['internal_port']}`,
    }

    const fakeLoading = () => {
      setTimeout(() => {
        setLoading(false)
        onClose()
      }, 150)
    }

    if (setPortData) {
      // edit current port
      if (port) {
        fakeLoading()
        setPortData({
          ports: portData?.ports?.map((currentPort) => {
            if (
              currentPort.application_port === (port as PortData).application_port &&
              currentPort.protocol === (port as PortData).protocol
            ) {
              return newPortRow
            } else {
              return currentPort
            }
          }) as PortData[],
          healthchecks: portData?.healthchecks || undefined,
        })

        // create new port
      } else {
        if (portData?.ports && portData.ports.length > 0) {
          // check if port already exist
          if (portData?.ports.some((currentPort) => currentPort.application_port === newPortRow.application_port)) {
            setLoading(false)
            toast(ToastEnum.ERROR, 'Error', 'Port already exist for this service.')
            return
          }

          fakeLoading()
          setPortData({
            ports: [...portData.ports, newPortRow],
            healthchecks: portData?.healthchecks || undefined,
          })
        } else {
          fakeLoading()
          setPortData({
            ports: [newPortRow],
            healthchecks: portData?.healthchecks || undefined,
          })
        }
      }
    }
  })

  useEffect(() => {
    enableAlertClickOutside(methods.formState.isDirty)
  }, [methods.formState, enableAlertClickOutside])

  return (
    <FormProvider {...methods}>
      <CrudModal
        onSubmit={onSubmit}
        onClose={onClose}
        loading={loading}
        isEdit={!!port}
        cloudProvider={environment?.cloud_provider.provider as CloudProviderEnum}
        hidePortName={hidePortName}
      />
    </FormProvider>
  )
}

export default CrudModalFeature
