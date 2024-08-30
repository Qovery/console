import { type Healthcheck, type ServicePort } from 'qovery-typescript-axios'
import { NeedHelp } from '@qovery/shared/assistant/feature'
import { type PortData } from '@qovery/shared/interfaces'
import { BlockContent, Button, EmptyState, Heading, Icon, IconAwesomeEnum, Section, Tooltip } from '@qovery/shared/ui'
import { isMatchingHealthCheck } from '../../utils/port-healthcheck'

export interface FlowCreatePortProps {
  onAddPort: () => void
  onRemovePort: (port: PortData | ServicePort, warning?: string) => void
  ports?: PortData[] | ServicePort[]
  healthchecks?: Healthcheck
  onBack?: () => void
  onEdit?: (port: PortData | ServicePort) => void
  isSetting?: boolean
  onSubmit?: () => void
  hidePortName?: boolean
}

export function FlowCreatePort({
  ports,
  healthchecks,
  onAddPort,
  onRemovePort,
  isSetting,
  onSubmit,
  onBack,
  onEdit,
  hidePortName,
}: FlowCreatePortProps) {
  const livenessType = healthchecks?.liveness_probe?.type
  const readinessType = healthchecks?.readiness_probe?.type

  return (
    <Section>
      <div className="mb-10 flex justify-between">
        <div>
          <Heading className="mb-2">Ports</Heading>

          <p className={isSetting ? 'mb-3 max-w-lg text-sm text-neutral-400' : 'text-xs text-neutral-400'}>
            Declare TCP/UDP ports used by your application. Declared ports are accessible from other applications within
            the same environment. You can also expose them on the internet by making them public. Declared ports are
            also used to check the liveness/readiness of your application
          </p>
          {isSetting && <NeedHelp />}
        </div>

        {isSetting && (
          <Button size="md" variant="solid" color="brand" data-testid="add-button" onClick={() => onAddPort()}>
            Add Port
            <Icon iconName="circle-plus" iconStyle="regular" className="ml-2" />
          </Button>
        )}
      </div>

      <div className="mb-10">
        {!isSetting || (ports && ports.length > 0) ? (
          <BlockContent title="Configured ports" classNameContent="p-0">
            {ports &&
              ports.map((customPort) => (
                <div
                  key={`${customPort.protocol}-${customPort.name}-${customPort.external_port}`}
                  className="flex w-full items-center justify-between gap-3 border-b border-neutral-250 px-5 py-4 last:border-0"
                  data-testid="form-row"
                >
                  <div className="flex flex-row">
                    {healthchecks &&
                      (isMatchingHealthCheck(customPort, livenessType) ||
                      isMatchingHealthCheck(customPort, readinessType) ? (
                        <Tooltip side="top" content="A health check is running on this port">
                          <div className="mr-4 inline-flex items-center">
                            <Icon
                              name={IconAwesomeEnum.SHIELD_CHECK}
                              className="flex w-5 justify-center text-green-500 hover:text-green-700"
                            />
                          </div>
                        </Tooltip>
                      ) : (
                        <div className="w-9"></div>
                      ))}
                    <div className="text-xs">
                      <span className="font-medium text-neutral-400">
                        Application Port:{' '}
                        {(customPort as PortData).application_port || (customPort as ServicePort).internal_port}
                      </span>
                      <p className="mt-1 flex gap-3 text-neutral-350">
                        <span>
                          Public:{' '}
                          {(customPort as PortData).is_public || (customPort as ServicePort).publicly_accessible
                            ? 'Yes'
                            : 'No'}
                        </span>
                        <span>Protocol: {(customPort as ServicePort).protocol}</span>
                        {!hidePortName &&
                          ((customPort as ServicePort).publicly_accessible || (customPort as PortData).is_public) && (
                            <span>Port Name: {(customPort as ServicePort).name}</span>
                          )}
                        {((customPort as ServicePort).publicly_accessible || (customPort as PortData).is_public) && (
                          <span>
                            External Port:{' '}
                            {(customPort as ServicePort).external_port || (customPort as PortData).external_port}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div>
                    {onEdit && (
                      <Button
                        data-testid="edit-button"
                        variant="surface"
                        color="neutral"
                        size="md"
                        className="mr-2 h-9 w-9 justify-center"
                        onClick={() => onEdit(customPort)}
                      >
                        <Icon iconName="gear" />
                      </Button>
                    )}
                    {onRemovePort && (
                      <Button
                        data-testid="delete-button"
                        variant="surface"
                        color="neutral"
                        size="md"
                        className="h-9 w-9 justify-center"
                        onClick={() =>
                          onRemovePort(
                            customPort,
                            isMatchingHealthCheck(customPort, livenessType) ||
                              isMatchingHealthCheck(customPort, readinessType)
                              ? 'The health check pointing to this port will be deleted as well.'
                              : undefined
                          )
                        }
                      >
                        <Icon iconName="trash" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            {!isSetting && (
              <div className="flex items-center justify-end px-4 py-3">
                <Button onClick={onAddPort}>
                  Add port
                  <Icon iconName="circle-plus" iconStyle="regular" className="ml-2" />
                </Button>
              </div>
            )}
          </BlockContent>
        ) : (
          <EmptyState title="No port are set" description="Define a custom port for your application" />
        )}
      </div>

      {!isSetting && (
        <div className="flex justify-between">
          <Button variant="plain" color="neutral" size="lg" onClick={onBack}>
            Back
          </Button>
          <Button data-testid="button-submit" size="lg" onClick={onSubmit}>
            Continue
          </Button>
        </div>
      )}
    </Section>
  )
}

export default FlowCreatePort
