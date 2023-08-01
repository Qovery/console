import { CloudProviderEnum, PortProtocolEnum, ServicePort } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { editApplication, postApplicationActionsRedeploy } from '@qovery/domains/application'
import { useFetchEnvironment } from '@qovery/domains/environment'
import { CrudModal, defaultLivenessProbe } from '@qovery/shared/console-shared'
import { ProbeTypeEnum, getServiceType } from '@qovery/shared/enums'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import { useModal } from '@qovery/shared/ui'
import { AppDispatch } from '@qovery/store'

export interface CrudModalFeatureProps {
  onClose: () => void
  projectId: string
  application?: ApplicationEntity
  port?: ServicePort
}

export const handleSubmit = (
  { internal_port, external_port, publicly_accessible, protocol, name }: FieldValues,
  application: ApplicationEntity,
  currentPort?: ServicePort
) => {
  const cloneApplication = Object.assign({}, application)

  const ports: ServicePort[] | [] = cloneApplication.ports || []

  const currentProtocol = protocol ? protocol : currentPort?.protocol

  const port = {
    internal_port: parseInt(internal_port, 10),
    external_port: publicly_accessible
      ? parseInt(
          currentProtocol === PortProtocolEnum.TCP || currentProtocol === PortProtocolEnum.UDP
            ? internal_port
            : external_port,
          10
        )
      : undefined,
    publicly_accessible: publicly_accessible,
    protocol: currentProtocol,
    name: name,
  }

  if (currentPort) {
    cloneApplication.ports = application.ports?.map((p: ServicePort) => {
      if (p.id === currentPort.id) {
        return port
      } else {
        return p
      }
    }) as ServicePort[]
  } else {
    cloneApplication.ports = [...ports, port] as ServicePort[]
  }

  if (ports.length === 0) {
    cloneApplication.healthchecks = {
      liveness_probe: {
        type: {
          [ProbeTypeEnum.TCP.toLowerCase()]: {
            port: port.internal_port,
            host: null,
          },
        },
        ...defaultLivenessProbe,
      },
    }
  }

  return cloneApplication
}

export function CrudModalFeature({ application, onClose, projectId, port }: CrudModalFeatureProps) {
  const [loading, setLoading] = useState(false)
  const { enableAlertClickOutside } = useModal()
  const { data: environment } = useFetchEnvironment(projectId, application?.environment?.id || '')

  const methods = useForm({
    defaultValues: {
      internal_port: port ? port.internal_port : undefined,
      external_port: port ? port.external_port : undefined,
      publicly_accessible: port ? port.publicly_accessible : false,
      protocol: port ? port.protocol : undefined,
      name: port ? port.name : undefined,
    },
    mode: 'onChange',
  })
  const dispatch = useDispatch<AppDispatch>()

  const toasterCallback = () => {
    if (application) {
      dispatch(
        postApplicationActionsRedeploy({
          applicationId: application?.id || '',
          environmentId: application?.environment?.id || '',
          serviceType: getServiceType(application),
        })
      )
    }
  }

  const onSubmit = methods.handleSubmit((data) => {
    if (!application) return

    setLoading(true)
    const cloneApplication = handleSubmit(data, application, port)

    dispatch(
      editApplication({
        applicationId: application.id,
        data: cloneApplication,
        serviceType: getServiceType(application),
        toasterCallback,
      })
    )
      .unwrap()
      .then(() => {
        setLoading(false)
        onClose()
      })
      .catch((e) => {
        setLoading(false)
        console.error(e)
      })
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
        cloudProvider={environment?.cloud_provider.provider as CloudProviderEnum}
        isEdit={!!port}
      />
    </FormProvider>
  )
}

export default CrudModalFeature
