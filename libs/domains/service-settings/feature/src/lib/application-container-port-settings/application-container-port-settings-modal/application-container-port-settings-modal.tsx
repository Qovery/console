import {
  type ApplicationEditRequest,
  type CloudProviderEnum,
  type ContainerRequest,
  PortProtocolEnum,
  type Probe,
  type ProbeType,
  type ServicePort,
} from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { type AnyService, type Application, type Container } from '@qovery/domains/services/data-access'
import {
  ApplicationContainerPortCrudModal as ApplicationContainerPortCrudModalForm,
  useEditService,
} from '@qovery/domains/services/feature'
import { ProbeTypeEnum } from '@qovery/shared/enums'
import { useModal } from '@qovery/shared/ui'
import { buildEditServicePayload } from '@qovery/shared/util-services'
import { isMatchingPortHealthCheck } from '../is-matching-port-healthcheck'

export interface ApplicationContainerPortSettingsModalProps {
  service: Extract<AnyService, Application | Container>
  organizationId: string
  projectId: string
  environmentId: string
  onClose: () => void
  port?: ServicePort
}

interface ApplicationContainerPortFormData {
  internal_port?: string
  external_port?: string
  publicly_accessible: boolean
  protocol?: PortProtocolEnum
  name?: string
  public_path?: string
  public_path_rewrite?: string
  rewrite_public_path?: boolean
}

const defaultLivenessProbe = {
  initial_delay_seconds: 30,
  period_seconds: 10,
  timeout_seconds: 5,
  success_threshold: 1,
  failure_threshold: 3,
}

export function handleApplicationContainerPortSubmit<
  T extends Application | Container,
  R = T extends Application ? ApplicationEditRequest : ContainerRequest,
>(data: ApplicationContainerPortFormData, service: T, currentPort?: ServicePort): R {
  const cloneService = Object.assign({}, service)
  const ports: ServicePort[] = cloneService.ports || []

  const currentProtocol = data.protocol ?? currentPort?.protocol
  const currentInternalPort = data.internal_port ? parseInt(data.internal_port, 10) : currentPort?.internal_port
  const currentExternalPort = data.external_port ? parseInt(data.external_port, 10) : currentPort?.external_port

  if (!currentProtocol || !currentInternalPort) {
    return service as unknown as R
  }

  const nextPort = {
    internal_port: currentInternalPort,
    external_port: data.publicly_accessible
      ? currentProtocol === PortProtocolEnum.TCP || currentProtocol === PortProtocolEnum.UDP
        ? currentInternalPort
        : currentExternalPort
      : undefined,
    publicly_accessible: data.publicly_accessible,
    protocol: currentProtocol,
    name: data.name,
    ...(data.public_path && data.public_path !== '' ? { public_path: data.public_path } : {}),
    ...(data.public_path_rewrite && data.public_path_rewrite !== ''
      ? { public_path_rewrite: data.public_path_rewrite }
      : {}),
  }

  if (currentPort) {
    cloneService.ports = service.ports?.map((port) => (port.id === currentPort.id ? nextPort : port)) as ServicePort[]

    const livenessProbe = cloneService.healthchecks?.liveness_probe
    const readinessProbe = cloneService.healthchecks?.readiness_probe

    type PortProtocol = keyof typeof PortProtocolEnum
    const getProbeProtocol = (probeType: ProbeType | undefined) =>
      Object.keys(probeType ?? {}).find((key) => probeType?.[key as keyof ProbeType] !== null) ?? null

    const updateProbe = (probe?: Probe | null) => {
      const probeProtocol = getProbeProtocol(probe?.type) as Lowercase<PortProtocol> | null
      if (!probeProtocol) {
        return probe
      }

      return isMatchingPortHealthCheck(currentPort, probe?.type)
        ? {
            ...probe,
            type: {
              ...probe?.type,
              [probeProtocol]: {
                ...probe?.type?.[probeProtocol as Exclude<Lowercase<PortProtocol>, 'udp'>],
                port: currentInternalPort,
              },
            },
          }
        : probe
    }

    cloneService.healthchecks = {
      ...cloneService.healthchecks,
      liveness_probe: updateProbe(livenessProbe),
      readiness_probe: updateProbe(readinessProbe),
    }
  } else {
    cloneService.ports = [...ports, nextPort] as ServicePort[]
  }

  if (ports.length === 0) {
    cloneService.healthchecks = {
      liveness_probe: {
        type: {
          [ProbeTypeEnum.TCP.toLowerCase()]: {
            port: nextPort.internal_port,
            host: null,
          },
        },
        ...defaultLivenessProbe,
      },
    }
  }

  return cloneService as R
}

export function ApplicationContainerPortSettingsModal({
  service,
  organizationId,
  projectId,
  environmentId,
  onClose,
  port,
}: ApplicationContainerPortSettingsModalProps) {
  const { enableAlertClickOutside } = useModal()
  const { data: environment } = useEnvironment({ environmentId })
  const { mutateAsync: editService, isLoading: isLoadingEditService } = useEditService({
    organizationId,
    projectId,
    environmentId,
  })

  const livenessType = service.healthchecks?.liveness_probe?.type
  const readinessType = service.healthchecks?.readiness_probe?.type

  const methods = useForm<ApplicationContainerPortFormData>({
    defaultValues: {
      internal_port: port ? `${port.internal_port}` : undefined,
      external_port: port ? `${port.external_port}` : undefined,
      publicly_accessible: port ? port.publicly_accessible : false,
      protocol: port ? port.protocol : undefined,
      name: port ? port.name : undefined,
      rewrite_public_path: port ? port.public_path_rewrite !== null || port.public_path !== '/' : false,
      public_path: port ? port.public_path : undefined,
      public_path_rewrite: port ? port.public_path_rewrite : undefined,
    },
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit(async (data) => {
    const payload = match(service)
      .with({ serviceType: 'APPLICATION' }, (application) =>
        buildEditServicePayload({
          service: application,
          request: handleApplicationContainerPortSubmit(data, application, port),
        })
      )
      .with({ serviceType: 'CONTAINER' }, (container) =>
        buildEditServicePayload({
          service: container,
          request: handleApplicationContainerPortSubmit(data, container, port),
        })
      )
      .exhaustive()

    try {
      await editService({
        serviceId: service.id,
        payload,
      })
      onClose()
    } catch (error) {
      console.error(error)
    }
  })

  useEffect(() => {
    enableAlertClickOutside(methods.formState.isDirty)
  }, [methods.formState.isDirty, enableAlertClickOutside])

  return (
    <FormProvider {...methods}>
      <ApplicationContainerPortCrudModalForm
        cloudProvider={environment?.cloud_provider.provider as CloudProviderEnum | undefined}
        currentProtocol={port?.protocol}
        isEdit={Boolean(port)}
        isMatchingHealthCheck={
          isMatchingPortHealthCheck(port, livenessType) || isMatchingPortHealthCheck(port, readinessType)
        }
        loading={isLoadingEditService}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </FormProvider>
  )
}

export default ApplicationContainerPortSettingsModal
