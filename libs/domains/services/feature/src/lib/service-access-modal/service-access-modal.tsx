import { type Credentials } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { type Application, type Container, type Database } from '@qovery/domains/services/data-access'
import { useVariables } from '@qovery/domains/variables/feature'
import { APPLICATION_SETTINGS_PORT_URL, APPLICATION_SETTINGS_URL, APPLICATION_URL } from '@qovery/shared/routes'
import {
  Accordion,
  Button,
  ExternalLink,
  Heading,
  Icon,
  Link,
  LoaderSpinner,
  Section,
  TabsPrimitives,
  ToastEnum,
  Tooltip,
  toast,
} from '@qovery/shared/ui'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'
import useMasterCredentials from '../hooks/use-master-credentials/use-master-credentials'
import CopyButton from './copy-button/copy-button'
import SectionExpand from './section-expand/section-expand'

const { Tabs } = TabsPrimitives

export interface ServiceAccessModalProps {
  organizationId: string
  projectId: string
  service: Application | Container | Database
  onClose: () => void
}

function SectionDatabaseConnectionUri({ service }: { service: Database }) {
  const [, copyToClipboard] = useCopyToClipboard()
  const { data: masterCredentials } = useMasterCredentials({ serviceId: service.id, serviceType: 'DATABASE' })

  const handleCopyCredentials = (credentials: Credentials) => {
    const connectionURI = `${credentials?.login}:${credentials?.password}@${credentials?.host}:${credentials?.port}`
    copyToClipboard(connectionURI)
    toast(ToastEnum.SUCCESS, 'Credentials copied to clipboard')
  }

  const title = match(service)
    .with({ accessibility: 'PUBLIC' }, () => 'Access')
    .otherwise(() => '3. Access')

  return (
    <div className="flex flex-col gap-1.5 rounded border border-neutral-250 px-4 py-3 text-sm">
      <span className="font-medium">{title}</span>
      <p className="mb-1.5 text-neutral-350">
        Get the connection URI and connect to the database with your favourite client.
      </p>
      <Button
        className="max-w-max gap-2"
        color="neutral"
        variant="surface"
        size="md"
        onClick={() => handleCopyCredentials(masterCredentials!)}
      >
        Copy connection URI
        <Icon className="text-sm" iconName="key" iconStyle="regular" />
      </Button>
    </div>
  )
}

export function ServiceAccessModal({ service, organizationId, projectId, onClose }: ServiceAccessModalProps) {
  const { serviceType } = service

  const { data: variables = [], isLoading: isLoadingVariables } = useVariables({
    parentId: serviceType === 'DATABASE' ? service.environment.id : service.id,
    scope: serviceType === 'DATABASE' ? 'ENVIRONMENT' : serviceType,
  })

  const ports = match(service)
    .with({ serviceType: 'APPLICATION' }, { serviceType: 'CONTAINER' }, (s) => s.ports)
    .otherwise(() => undefined)

  const connectPortForward = match(service)
    .with(
      { serviceType: 'DATABASE' },
      (s) =>
        `qovery port-forward -p ${s.port} https://console.qovery.com/organization/${organizationId}/project/${projectId}/environment/${service.environment.id}/database/${service.id}`
    )
    .otherwise(
      () =>
        `qovery port-forward https://console.qovery.com/organization/${organizationId}/project/${projectId}/environment/${service.environment.id}/application/${service.id} -p [local-port]:[target-port]`
    )

  return (
    <Section className="p-5">
      <Heading className="h4 max-w-sm truncate text-neutral-400">Access from</Heading>
      <p className="mb-4 mt-2 text-sm text-neutral-350">
        This section explains how to connect to this service from another service or from your local machine.
      </p>
      <Tabs.Root defaultValue="another-service">
        <Tabs.List className="w-full">
          <Tabs.Trigger size="md" value="another-service" className="flex-auto justify-start pl-0">
            Another service
          </Tabs.Trigger>
          {match(service)
            .with({ serviceType: 'DATABASE', accessibility: 'PUBLIC' }, () => (
              <Tabs.Trigger size="md" value="public-access" className="flex-auto justify-start pl-0">
                Public access
              </Tabs.Trigger>
            ))
            .otherwise(() => (
              <Tabs.Trigger size="md" value="local-machine" className="flex-auto justify-start pl-0">
                Local machine
              </Tabs.Trigger>
            ))}
        </Tabs.List>
        <div className="mt-6">
          <Tabs.Content className="flex flex-col gap-4" value="another-service">
            <Accordion.Root type="multiple" className="flex flex-col gap-4">
              {serviceType !== 'DATABASE' && (
                <div className="flex flex-col gap-1.5 rounded border border-neutral-250 px-4 py-3 text-sm">
                  <span className="font-medium">How to connect</span>
                  <p className="text-neutral-350">
                    You can interconnect services via the declared ports and the Qovery BUILT_IN environment variables.
                    These variables contains the connection parameter of the service and they are automatically injected
                    on every service of the environment. To match the variables naming convention within your code,
                    create an alias.
                  </p>
                </div>
              )}
              {ports && (
                <SectionExpand
                  title="1. Declared ports"
                  description="Below you can find the ports exposed by this service."
                >
                  {!ports || ports.length === 0 ? (
                    <div className="flex w-full flex-col gap-2 py-4 text-center text-sm">
                      <span className="font-medium text-neutral-350">No ports declared yet.</span>
                      <Link
                        className="justify-center"
                        to={
                          APPLICATION_URL(organizationId, projectId, service.environment.id, service.id) +
                          APPLICATION_SETTINGS_URL +
                          APPLICATION_SETTINGS_PORT_URL
                        }
                        onClick={() => onClose()}
                      >
                        Declare a port in application settings
                      </Link>
                    </div>
                  ) : (
                    <div>
                      {ports.map((port) => (
                        <div
                          key={port.id}
                          className="flex h-14 items-center justify-between border-b border-neutral-250 px-4 last:border-0"
                        >
                          <div className="flex gap-6 text-neutral-350">
                            <p className="text-neutral-350">
                              Application port:{' '}
                              <span className="font-medium text-neutral-400">{port.internal_port}</span>
                            </p>
                            {port.external_port && (
                              <p className="text-neutral-350">
                                External port:{' '}
                                <span className="font-medium text-neutral-400">{port.external_port}</span>
                              </p>
                            )}
                            <p className="text-neutral-350">
                              Public:{' '}
                              <span className="font-medium text-neutral-400">
                                {port.publicly_accessible ? 'Yes' : 'No'}
                              </span>
                            </p>
                            <p className="text-neutral-350">
                              Protocol: <span className="font-medium text-neutral-400">{port.protocol}</span>
                            </p>
                            <p className="text-neutral-350">
                              Port name: <span className="font-medium text-neutral-400">{port.name}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                      <div className="flex h-14 items-center justify-center">
                        <Link
                          onClick={() => onClose()}
                          to={
                            APPLICATION_URL(organizationId, projectId, service.environment.id, service.id) +
                            APPLICATION_SETTINGS_URL +
                            APPLICATION_SETTINGS_PORT_URL
                          }
                        >
                          Declare a port in application settings
                        </Link>
                      </div>
                    </div>
                  )}
                </SectionExpand>
              )}
              <SectionExpand
                title={
                  serviceType !== 'DATABASE' ? '2. BUILT_IN environment variables' : 'BUILT_IN environment variables'
                }
                description={
                  serviceType !== 'DATABASE'
                    ? 'Below you can find the BUILT_IN env vars for this service and the aliases defined at environment level.'
                    : 'Qovery injects on every service of the environment a set of environment variables (called BUILT_IN) containing the connection parameters of this service. To match the variables naming convention within your code, create an alias. Below you can find the BUILT_IN env vars for this service and the aliases defined at environment level.'
                }
              >
                {isLoadingVariables ? (
                  <div className="flex justify-center p-5">
                    <LoaderSpinner className="w-5" />
                  </div>
                ) : (
                  <>
                    {variables
                      ?.filter(
                        (v) =>
                          v.service_id === service.id &&
                          (v.scope === 'BUILT_IN' || v.aliased_variable?.scope === 'BUILT_IN')
                      )
                      ?.map((variable) => (
                        <div
                          key={variable.id}
                          className="flex flex-col justify-center gap-1 border-b border-neutral-250 px-4 py-3 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex items-center truncate">
                              {variable.aliased_variable && (
                                <span className="mr-2 inline-flex h-5 items-center rounded-sm bg-teal-500 px-1 text-2xs font-bold text-neutral-50">
                                  ALIAS
                                </span>
                              )}
                              <span className="truncate text-sm font-medium text-neutral-400">{variable.key}</span>
                              {variable.description && (
                                <Tooltip content={variable.description}>
                                  <span>
                                    <Icon
                                      iconName="circle-info"
                                      iconStyle="regular"
                                      className="ml-2 text-neutral-350"
                                    />
                                  </span>
                                </Tooltip>
                              )}
                            </div>
                          </div>
                          {variable.aliased_variable && (
                            <div className="flex flex-row gap-1 text-xs text-neutral-350">
                              <Icon iconName="arrow-turn-down-right" className="text-2xs text-neutral-300" />
                              <span>{variable.aliased_variable.key}</span>
                            </div>
                          )}
                        </div>
                      ))}
                  </>
                )}
              </SectionExpand>
            </Accordion.Root>
          </Tabs.Content>
          <Tabs.Content className="flex flex-col gap-4" value="local-machine">
            <div className="flex flex-col gap-2 rounded border border-neutral-250 px-4 py-3 text-sm">
              <span className="font-medium">1. Download/Update Qovery CLI</span>
              <p className="text-neutral-350">
                Download and install the Qovery CLI (or update its version to the latest version)
              </p>
              <ExternalLink href="https://hub.qovery.com/docs/using-qovery/interface/cli/#install">
                https://hub.qovery.com/docs/using-qovery/interface/cli/#install
              </ExternalLink>
            </div>
            <div className="flex flex-col gap-2 rounded border border-neutral-250 px-4 py-3 text-sm">
              <span className="font-medium">2. Connect via port-forward</span>
              <p className="text-neutral-350">
                {serviceType === 'DATABASE'
                  ? 'Run the following command from your terminal.'
                  : 'Replace the local-port/target-port and run the following command from your terminal.'}
              </p>
              <div className="flex gap-6 rounded-sm bg-neutral-150 p-3 text-neutral-400">
                <div>
                  <span className="select-none">$ </span>
                  {connectPortForward}
                </div>
                <CopyButton content={connectPortForward} />
              </div>
            </div>
            {serviceType === 'DATABASE' && <SectionDatabaseConnectionUri service={service} />}
          </Tabs.Content>
          {serviceType === 'DATABASE' && (
            <Tabs.Content className="flex flex-col gap-4" value="public-access">
              <SectionDatabaseConnectionUri service={service} />
            </Tabs.Content>
          )}
        </div>
      </Tabs.Root>
    </Section>
  )
}

export default ServiceAccessModal
