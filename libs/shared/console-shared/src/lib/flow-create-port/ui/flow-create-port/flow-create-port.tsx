import { type Healthcheck, type ServicePort } from 'qovery-typescript-axios'
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
}: FlowCreatePortProps) {
  const livenessType = healthchecks?.liveness_probe?.type
  const readinessType = healthchecks?.readiness_probe?.type

  return (
    <Section>
      <div className="flex justify-between mb-10">
        <div>
          <Heading className="mb-2">Ports</Heading>

          <p className={isSetting ? 'text-sm text-neutral-400 max-w-lg' : 'text-xs text-neutral-400'}>
            Declare TCP/UDP ports used by your application. Declared ports are accessible from other applications within
            the same environment. You can also expose them on the internet by making them public. Declared ports are
            also used to check the liveness/readiness of your application
          </p>
        </div>

        {isSetting && (
          <Button size="lg" variant="solid" color="brand" data-testid="add-button" onClick={() => onAddPort()}>
            Add Port
            <Icon iconName="circle-plus" className="ml-2" />
          </Button>
        )}
      </div>

      <div className="mb-10">
        {!isSetting || (ports && ports.length > 0) ? (
          <BlockContent title="Configured ports" classNameContent="p-0">
            {ports &&
              ports.map((customPort, i) => (
                <div
                  key={i}
                  className="flex justify-between w-full items-center gap-3 px-5 py-4 border-b border-neutral-250 last:border-0"
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
                              className="flex justify-center w-5 text-green-500 hover:text-green-700"
                            />
                          </div>
                        </Tooltip>
                      ) : (
                        <div className="w-9"></div>
                      ))}
                    <div className="text-xs">
                      <span className="text-neutral-400 font-medium">
                        Application Port:{' '}
                        {(customPort as PortData).application_port || (customPort as ServicePort).internal_port}
                      </span>
                      <p className="flex gap-3 text-neutral-350 mt-1">
                        <span>
                          Public:{' '}
                          {(customPort as PortData).is_public || (customPort as ServicePort).publicly_accessible
                            ? 'Yes'
                            : 'No'}
                        </span>
                        <span>Protocol: {(customPort as ServicePort).protocol}</span>
                        {((customPort as ServicePort).publicly_accessible || (customPort as PortData).is_public) && (
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
                        variant="outline"
                        color="neutral"
                        size="md"
                        className="justify-center w-9 h-9 mr-2"
                        onClick={() => onEdit(customPort)}
                      >
                        <Icon iconName="gear" />
                      </Button>
                    )}
                    {onRemovePort && (
                      <Button
                        data-testid="delete-button"
                        variant="outline"
                        color="neutral"
                        size="md"
                        className="justify-center w-9 h-9"
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
              <div className="flex justify-end items-center py-3 px-4">
                <Button onClick={onAddPort}>
                  Add port
                  <Icon iconName="circle-plus" className="ml-2" />
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
