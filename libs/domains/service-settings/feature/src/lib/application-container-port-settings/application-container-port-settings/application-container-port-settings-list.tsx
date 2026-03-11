import { type ProbeType, type ServicePort } from 'qovery-typescript-axios'
import { PortListRows } from '@qovery/domains/services/feature'
import { BlockContent, Button, EmptyState, Heading, Icon } from '@qovery/shared/ui'
import { isMatchingPortHealthCheck } from '../is-matching-port-healthcheck'

export interface ApplicationContainerPortSettingsListProps {
  ports?: ServicePort[]
  livenessProbeType?: ProbeType
  readinessProbeType?: ProbeType
  onAddPort: () => void
  onEditPort: (port: ServicePort) => void
  onRemovePort: (port: ServicePort, warning?: string) => void
}

export function ApplicationContainerPortSettingsList({
  ports,
  livenessProbeType,
  readinessProbeType,
  onAddPort,
  onEditPort,
  onRemovePort,
}: ApplicationContainerPortSettingsListProps) {
  return (
    <>
      <div className="mb-10 flex justify-between">
        <div>
          <Heading className="mb-2">Ports</Heading>
          <p className="text-sm text-neutral-subtle">
            Declare TCP/UDP ports used by your application. Declared ports are accessible from other applications within
            the same environment. You can also expose them on the internet by making them public.
          </p>
        </div>
        <Button size="md" variant="solid" color="brand" type="button" data-testid="add-button" onClick={onAddPort}>
          Add port
          <Icon iconName="circle-plus" iconStyle="regular" className="ml-2" />
        </Button>
      </div>

      <div className="mb-10">
        {ports && ports.length > 0 ? (
          <BlockContent title="Configured ports" classNameContent="p-0">
            <PortListRows
              ports={ports}
              getKey={(port) => port.id ?? `${port.protocol}-${port.name}-${port.external_port ?? port.internal_port}`}
              hasHealthcheck={(port) =>
                isMatchingPortHealthCheck(port, livenessProbeType) ||
                isMatchingPortHealthCheck(port, readinessProbeType)
              }
              getApplicationPort={(port) => port.internal_port}
              getIsPublic={(port) => port.publicly_accessible}
              getProtocol={(port) => port.protocol}
              getName={(port) => port.name}
              getExternalPort={(port) => port.external_port}
              getPublicPath={(port) => port.public_path ?? undefined}
              getPublicPathRewrite={(port) => port.public_path_rewrite ?? undefined}
              onEditPort={onEditPort}
              onRemovePort={(port) =>
                onRemovePort(
                  port,
                  isMatchingPortHealthCheck(port, livenessProbeType) ||
                    isMatchingPortHealthCheck(port, readinessProbeType)
                    ? 'The health check pointing to this port will be deleted as well.'
                    : undefined
                )
              }
            />
          </BlockContent>
        ) : (
          <EmptyState title="No ports are set" description="Define a custom port for your application" />
        )}
      </div>
    </>
  )
}

export default ApplicationContainerPortSettingsList
