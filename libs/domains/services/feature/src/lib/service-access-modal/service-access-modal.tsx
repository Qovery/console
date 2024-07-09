import { match } from 'ts-pattern'
import { type Application, type Database } from '@qovery/domains/services/data-access'
import { useVariables } from '@qovery/domains/variables/feature'
import { ExternalLink, Heading, Icon, Section, TabsPrimitives, Tooltip } from '@qovery/shared/ui'
import CopyButton from './copy-button/copy-button'
import SectionExpand from './section-expand/section-expand'

const { Tabs } = TabsPrimitives

export interface ServiceAccessModalProps {
  organizationId: string
  projectId: string
  service: Application | Database
}

export function ServiceAccessModal({ service, organizationId, projectId }: ServiceAccessModalProps) {
  const { serviceType } = service

  const { data: variables } = useVariables({
    parentId: serviceType === 'APPLICATION' ? service.id : service.environment.id,
    scope: serviceType === 'APPLICATION' ? 'APPLICATION' : 'ENVIRONMENT',
  })

  const ports = match(service)
    .with({ serviceType: 'APPLICATION' }, (s) => s.ports)
    .otherwise(() => undefined)

  return (
    <Section className="p-5">
      <Heading className="h4 max-w-sm truncate text-neutral-400">Access from</Heading>
      <p className="mb-4 mt-2 text-sm text-neutral-350">
        This section explains how to connect to this service from the public network, from another service or from your
        local machine.
      </p>
      <Tabs.Root defaultValue="another-service">
        <Tabs.List>
          <Tabs.Trigger size="md" value="another-service" className="w-1/2 justify-start pl-0">
            Another service
          </Tabs.Trigger>
          <Tabs.Trigger size="md" value="local-machine" className="w-1/2 justify-start pl-0">
            Local machine
          </Tabs.Trigger>
        </Tabs.List>
        <div className="mt-6">
          <Tabs.Content className="flex flex-col gap-4" value="another-service">
            {serviceType === 'APPLICATION' && (
              <div className="flex flex-col gap-1.5 rounded border border-neutral-250 px-4 py-3 text-sm">
                <span className="font-medium">How to connect</span>
                <p className="text-neutral-350">
                  You can interconnect services via the declared ports and the Qovery BUILT_IN environment variables.
                  These variables contains the connection parameter of the service and they are automatically injected
                  on every service of the environment. To match the variables naming convention within your code, create
                  an alias.
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
                    <ExternalLink
                      className="justify-center"
                      href="https://hub.qovery.com/docs/using-qovery/configuration/application/#ports"
                    >
                      Declare a port in application settings
                    </ExternalLink>
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
                            Application port: <span className="font-medium text-neutral-400">{port.internal_port}</span>
                          </p>
                          {port.external_port && (
                            <p className="text-neutral-350">
                              External port: <span className="font-medium text-neutral-400">{port.external_port}</span>
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
                      <ExternalLink href="https://hub.qovery.com/docs/using-qovery/configuration/application/#ports">
                        Declare a port in application settings
                      </ExternalLink>
                    </div>
                  </div>
                )}
              </SectionExpand>
            )}
            <SectionExpand
              title={
                serviceType === 'APPLICATION' ? '2. BUILT_IN environment variables' : 'BUILT_IN environment variables'
              }
              description={
                serviceType === 'APPLICATION'
                  ? 'Below you can find the BUILT_IN env vars for this service and the aliases defined at environment level.'
                  : 'Qovery injects on every service of the environment a set of environment variables (called BUILT_IN) containing the connection parameters of this service. To match the variables naming convention within your code, create an alias. Below you can find the BUILT_IN env vars for this service and the aliases defined at environment level.'
              }
            >
              <div className="max-h-60 overflow-y-scroll">
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
                                <Icon iconName="circle-info" iconStyle="solid" className="ml-2 text-neutral-350" />
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
              </div>
            </SectionExpand>
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
              <p className="text-neutral-350">Run the following command from your terminal.</p>
              <div className="flex gap-6 rounded-sm bg-neutral-150 p-3 text-neutral-400">
                <div>
                  <span className="select-none">$ </span>qovery port-forward https://console.qovery.com/organization/
                  {organizationId}/project/{projectId}/environment/
                  {service.environment.id}/{serviceType.toLowerCase()}/{service.id} -p [local-port]:[target-port]
                </div>
                <CopyButton
                  content={`qovery port-forward
                        https://console.qovery.com/organization/${organizationId}/project/${projectId}/environment/
                        ${service.environment.id}/${serviceType.toLowerCase()}/${service.id} -p [local-port]:[target-port]`}
                />
              </div>
            </div>
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </Section>
  )
}

export default ServiceAccessModal
