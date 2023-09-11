import { type CloudProviderEnum, PortProtocolEnum, type Probe, type ServicePort } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { editApplication, postApplicationActionsRedeploy } from '@qovery/domains/application'
import { useFetchEnvironment } from '@qovery/domains/environment'
import { CrudModal, defaultLivenessProbe, isMatchingHealthCheck } from '@qovery/shared/console-shared'
import { ProbeTypeEnum, getServiceType } from '@qovery/shared/enums'
import { type ApplicationEntity } from '@qovery/shared/interfaces'
import { DEPLOYMENT_LOGS_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { useModal } from '@qovery/shared/ui'
import { type AppDispatch } from '@qovery/state/store'

export interface CrudModalFeatureProps {
  onClose: () => void
  organizationId: string
  projectId: string
  application?: ApplicationEntity
  port?: ServicePort
}

export const handleSubmit = (
  {
    internal_port,
    external_port,
    publicly_accessible,
    protocol,
    name,
  }: {
    internal_port: string | undefined
    external_port: string | undefined
    publicly_accessible: boolean
    protocol: PortProtocolEnum | undefined
    name: string | undefined
  },
  application: ApplicationEntity,
  currentPort?: ServicePort
) => {
  const cloneApplication = Object.assign({}, application)

  const ports: ServicePort[] | [] = cloneApplication.ports || []

  const currentProtocol = protocol ? protocol : currentPort?.protocol
  const currentInternalPort = internal_port ? parseInt(internal_port, 10) : currentPort?.internal_port
  const currentExternalPort = external_port ? parseInt(external_port, 10) : currentPort?.external_port

  // impossible due to form validation
  if (!protocol || !currentInternalPort) {
    return application
  }

  const port = {
    internal_port: currentInternalPort,
    external_port: publicly_accessible
      ? currentProtocol === PortProtocolEnum.TCP || currentProtocol === PortProtocolEnum.UDP
        ? currentInternalPort
        : currentExternalPort
      : undefined,
    publicly_accessible,
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

    const livenessProbe = cloneApplication.healthchecks?.liveness_probe
    const readinessProbe = cloneApplication.healthchecks?.readiness_probe
    type PortProtocol = keyof typeof PortProtocolEnum
    const probProtocol = (protocol as PortProtocol).toLowerCase() as Lowercase<PortProtocol>

    const updateProbe = (probe?: Probe) => {
      return isMatchingHealthCheck(currentPort, probe?.type) && currentPort.protocol === protocol
        ? {
            ...probe,
            type: {
              ...probe?.type,
              [probProtocol]: {
                ...probe?.type![probProtocol as Exclude<Lowercase<PortProtocol>, 'udp'>],
                port: currentInternalPort,
              },
            },
          }
        : probe
    }

    cloneApplication.healthchecks = {
      ...cloneApplication.healthchecks,
      liveness_probe: updateProbe(livenessProbe),
      readiness_probe: updateProbe(readinessProbe),
    }
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

export function CrudModalFeature({ application, onClose, port, organizationId, projectId }: CrudModalFeatureProps) {
  const [loading, setLoading] = useState(false)
  const { enableAlertClickOutside } = useModal()
  const navigate = useNavigate()
  const { data: environment } = useFetchEnvironment(projectId, application?.environment?.id || '')
  const livenessType = application?.healthchecks?.liveness_probe?.type
  const readinessType = application?.healthchecks?.readiness_probe?.type

  const methods = useForm({
    defaultValues: {
      internal_port: port ? `${port.internal_port}` : undefined,
      external_port: port ? `${port.external_port}` : undefined,
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
          callback: () =>
            navigate(
              ENVIRONMENT_LOGS_URL(organizationId, projectId, application?.environment?.id) +
                DEPLOYMENT_LOGS_URL(application?.id)
            ),
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
        cloudProvider={environment?.cloud_provider.provider as CloudProviderEnum}
        currentProtocol={port?.protocol}
        isEdit={!!port}
        isMatchingHealthCheck={isMatchingHealthCheck(port, livenessType) || isMatchingHealthCheck(port, readinessType)}
        loading={loading}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </FormProvider>
  )
}

export default CrudModalFeature
