import { type ProbeType } from 'qovery-typescript-axios'
import { type PortData } from '@qovery/shared/interfaces'
import { BlockContent, Button, Heading, Icon, Section } from '@qovery/shared/ui'
import { isMatchingHealthCheck } from '../port-healthcheck/port-healthcheck'
import { PortListRows } from '../port-list-rows/port-list-rows'

export interface ApplicationContainerPortListProps {
  ports?: PortData[]
  livenessProbeType?: ProbeType
  readinessProbeType?: ProbeType
  onAddPort: () => void
  onEditPort: (port: PortData) => void
  onRemovePort: (port: PortData) => void
  onBack: () => void
  onSubmit: () => void
  loading?: boolean
  hidePortName?: boolean
}

export function ApplicationContainerPortList({
  ports,
  livenessProbeType,
  readinessProbeType,
  onAddPort,
  onEditPort,
  onRemovePort,
  onBack,
  onSubmit,
  loading = false,
  hidePortName = true,
}: ApplicationContainerPortListProps) {
  return (
    <Section>
      <div className="mb-10">
        <Heading className="mb-2">Ports</Heading>

        <p className="text-sm text-neutral-subtle">
          Declare TCP/UDP ports used by your application. Declared ports are accessible from other applications within
          the same environment. You can also expose them on the internet by making them public. Declared ports are also
          used to check the liveness/readiness of your application.
        </p>
      </div>

      <div className="mb-10">
        <BlockContent title="Configured ports" classNameContent="p-0">
          <PortListRows
            ports={ports}
            hidePortName={hidePortName}
            getKey={(port) => `${port.protocol}-${port.name}-${port.external_port}`}
            hasHealthcheck={(port) =>
              isMatchingHealthCheck(port, livenessProbeType) || isMatchingHealthCheck(port, readinessProbeType)
            }
            getApplicationPort={(port) => port.application_port}
            getIsPublic={(port) => port.is_public}
            getProtocol={(port) => port.protocol}
            getName={(port) => port.name}
            getExternalPort={(port) => port.external_port}
            getPublicPath={(port) => port.public_path}
            getPublicPathRewrite={(port) => port.public_path_rewrite}
            onEditPort={onEditPort}
            onRemovePort={onRemovePort}
          />

          <div className="flex items-center justify-end px-4 py-3">
            <Button data-testid="add-button" size="md" variant="solid" color="brand" type="button" onClick={onAddPort}>
              Add port
              <Icon iconName="circle-plus" iconStyle="regular" className="ml-2" />
            </Button>
          </div>
        </BlockContent>
      </div>

      <div className="flex justify-between">
        <Button variant="plain" color="neutral" size="lg" type="button" onClick={onBack}>
          Back
        </Button>
        <Button data-testid="button-submit" size="lg" type="button" onClick={onSubmit} loading={loading}>
          Continue
        </Button>
      </div>
    </Section>
  )
}

export default ApplicationContainerPortList
