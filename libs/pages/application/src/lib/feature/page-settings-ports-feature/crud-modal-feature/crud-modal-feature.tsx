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
import { useCluster } from '@qovery/domains/clusters/feature'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { type AnyService, type Application, type Container } from '@qovery/domains/services/data-access'
import { useDeploymentStatus, useEditService } from '@qovery/domains/services/feature'
import { CrudModal, defaultLivenessProbe, isMatchingHealthCheck } from '@qovery/shared/console-shared'
import { ProbeTypeEnum } from '@qovery/shared/enums'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { useModal } from '@qovery/shared/ui'
import { buildEditServicePayload } from '@qovery/shared/util-services'

export interface CrudModalFeatureProps {
  onClose: () => void
  service: Extract<AnyService, Application | Container>
  port?: ServicePort
}

export function handleSubmit<
  T extends Application | Container,
  R = T extends Application ? ApplicationEditRequest : ContainerRequest,
>(
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
  service: T,
  currentPort?: ServicePort
): R {
  const cloneApplication = Object.assign({}, service)

  const ports: ServicePort[] | [] = cloneApplication.ports || []

  const currentProtocol = protocol ? protocol : currentPort?.protocol
  const currentInternalPort = internal_port ? parseInt(internal_port, 10) : currentPort?.internal_port
  const currentExternalPort = external_port ? parseInt(external_port, 10) : currentPort?.external_port

  // impossible due to form validation
  if (!protocol || !currentInternalPort) {
    return service as unknown as R
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
    cloneApplication.ports = service.ports?.map((p: ServicePort) => {
      if (p.id === currentPort.id) {
        return port
      } else {
        return p
      }
    }) as ServicePort[]

    const livenessProbe = cloneApplication.healthchecks?.liveness_probe
    const readinessProbe = cloneApplication.healthchecks?.readiness_probe
    type PortProtocol = keyof typeof PortProtocolEnum

    const getProbeProtocol = (probeType: ProbeType | undefined) => {
      return Object.keys(probeType ?? {}).find((key) => probeType?.[key as keyof ProbeType] !== null) ?? null
    }

    const updateProbe = (probe?: Probe | null) => {
      const probProtocol = getProbeProtocol(probe?.type) as Lowercase<PortProtocol>

      return isMatchingHealthCheck(currentPort, probe?.type)
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

  return cloneApplication as R
}

export function CrudModalFeature({ service, onClose, port }: CrudModalFeatureProps) {
  const { enableAlertClickOutside } = useModal()

  const { data: deploymentStatus } = useDeploymentStatus({
    environmentId: service.environment.id,
    serviceId: service.id,
  })
  const { data: environment } = useEnvironment({ environmentId: service?.environment?.id || '' })
  const { data: cluster } = useCluster({
    organizationId: environment?.organization.id ?? '',
    clusterId: environment?.cluster_id ?? '',
  })
  const { mutateAsync: editService, isLoading: isLoadingEditService } = useEditService({
    environmentId: service.environment?.id || '',
    logsLink:
      ENVIRONMENT_LOGS_URL(environment?.organization.id, environment?.project.id, service.environment?.id) +
      DEPLOYMENT_LOGS_VERSION_URL(service.id, deploymentStatus?.execution_id),
  })

  const livenessType = service.healthchecks?.liveness_probe?.type
  const readinessType = service.healthchecks?.readiness_probe?.type

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

  const onSubmit = methods.handleSubmit(async (data) => {
    const payload = match(service)
      .with({ serviceType: 'APPLICATION' }, (service) =>
        buildEditServicePayload({
          service,
          request: handleSubmit(data, service, port),
        })
      )
      .with({ serviceType: 'CONTAINER' }, (service) =>
        buildEditServicePayload({
          service,
          request: handleSubmit(data, service, port),
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
  }, [methods.formState, enableAlertClickOutside])

  return (
    <FormProvider {...methods}>
      <CrudModal
        cloudProvider={environment?.cloud_provider.provider as CloudProviderEnum}
        kubernetes={cluster?.kubernetes}
        currentProtocol={port?.protocol}
        isEdit={!!port}
        isDemo={cluster?.is_demo}
        isMatchingHealthCheck={isMatchingHealthCheck(port, livenessType) || isMatchingHealthCheck(port, readinessType)}
        loading={isLoadingEditService}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </FormProvider>
  )
}

export default CrudModalFeature
