import { type CloudProviderEnum, PortProtocolEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { type FlowPortData, type PortData } from '@qovery/shared/interfaces'
import { ToastEnum, toast, useModal } from '@qovery/shared/ui'
import { useEnvironment } from '../../../../hooks/use-environment/use-environment'
import { isMatchingHealthCheck } from '../port-healthcheck/port-healthcheck'
import { ApplicationContainerPortCrudModal } from './application-container-port-crud-modal'

export interface ApplicationContainerPortModalProps {
  environmentId: string
  onClose: () => void
  port?: PortData
  portData: FlowPortData
  setPortData: (portData: FlowPortData) => void
  hidePortName?: boolean
}

export function ApplicationContainerPortModal({
  port,
  portData,
  setPortData,
  onClose,
  environmentId,
  hidePortName = true,
}: ApplicationContainerPortModalProps) {
  const [loading, setLoading] = useState(false)
  const { enableAlertClickOutside } = useModal()
  const { data: environment } = useEnvironment({ environmentId })

  const methods = useForm({
    defaultValues: {
      internal_port: port?.application_port,
      external_port: port?.external_port,
      publicly_accessible: port?.is_public ?? false,
      protocol: port?.protocol ?? PortProtocolEnum.HTTP,
      name: port?.name ?? '',
      public_path: port?.public_path,
      public_path_rewrite: port?.public_path_rewrite,
      rewrite_public_path: Boolean(port?.public_path || port?.public_path_rewrite),
    },
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit((data) => {
    setLoading(true)

    const newPortRow: PortData = {
      application_port: data.internal_port || undefined,
      external_port: data.external_port || undefined,
      is_public: data.publicly_accessible || false,
      protocol: data.protocol || PortProtocolEnum.HTTP,
      name: data.name || `p${data.internal_port}`,
      public_path: data.public_path,
      public_path_rewrite: data.public_path_rewrite,
    }

    if (port) {
      setPortData({
        ports: portData.ports?.map((currentPort) => {
          if (
            currentPort.application_port === port.application_port &&
            currentPort.protocol === port.protocol &&
            currentPort.name === port.name
          ) {
            return newPortRow
          }

          return currentPort
        }),
        healthchecks: portData.healthchecks,
      })
      setLoading(false)
      onClose()
      return
    }

    if (portData.ports?.some((currentPort) => currentPort.application_port === newPortRow.application_port)) {
      setLoading(false)
      toast(ToastEnum.ERROR, 'Error', 'Port already exists for this service.')
      return
    }

    setPortData({
      ports: [...(portData.ports ?? []), newPortRow],
      healthchecks: portData.healthchecks,
    })

    setLoading(false)
    onClose()
  })

  useEffect(() => {
    enableAlertClickOutside(methods.formState.isDirty)
  }, [methods.formState.isDirty, enableAlertClickOutside])

  const livenessProbeType = portData.healthchecks?.item?.liveness_probe?.type
  const readinessProbeType = portData.healthchecks?.item?.readiness_probe?.type

  const hasMatchingHealthcheck =
    isMatchingHealthCheck(port, livenessProbeType) || isMatchingHealthCheck(port, readinessProbeType)

  return (
    <FormProvider {...methods}>
      <ApplicationContainerPortCrudModal
        onSubmit={onSubmit}
        onClose={onClose}
        loading={loading}
        isEdit={Boolean(port)}
        cloudProvider={environment?.cloud_provider.provider as CloudProviderEnum | undefined}
        currentProtocol={port?.protocol}
        isMatchingHealthCheck={hasMatchingHealthcheck}
        hidePortName={hidePortName}
      />
    </FormProvider>
  )
}

export default ApplicationContainerPortModal
