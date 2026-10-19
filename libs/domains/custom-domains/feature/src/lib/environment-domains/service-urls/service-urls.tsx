import { Link, useParams } from '@tanstack/react-router'
import { useState } from 'react'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { BlockContent, Button, Callout, Icon, InputSelectSmall, Section, useModal } from '@qovery/shared/ui'
import { AddDomainModal } from '../add-domain-modal/add-domain-modal'
import { receivedPath, routesForService } from '../domain-routing'
import { RouteForm } from '../route-form/route-form'
import {
  MOCK_CNAME_TARGET,
  MOCK_HOSTS_IN_OTHER_ENVIRONMENTS,
  domainRoutingMockActions,
  useDomainRoutingMock,
} from '../use-domain-routing-mock'

// Service-side entry point to the environment routing table: "on which URLs does this service answer?".
export function ServiceUrls() {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })
  const { domains, services } = useDomainRoutingMock(environmentId)
  const { openModal, closeModal } = useModal()
  const [editing, setEditing] = useState<string | null>(null)
  const [targetDomainId, setTargetDomainId] = useState<string>()

  // Real services get mock ports. Environments with fewer than 3 services get sample services instead,
  // so the page is previewed with the sample API service.
  const realService = services.find((s) => s.id === serviceId)
  const service = realService ?? services[1]
  if (!service) return null

  const serviceRoutes = routesForService(domains, service.id)
  const targetDomain = domains.find((d) => d.id === targetDomainId) ?? domains[0]

  const openAddDomainModal = () =>
    openModal({
      content: (
        <AddDomainModal
          domains={domains}
          services={services}
          cnameTarget={MOCK_CNAME_TARGET}
          findHostOwner={(host) => MOCK_HOSTS_IN_OTHER_ENVIRONMENTS[host]}
          defaultServiceId={service.id}
          onSubmit={({ host, ...options }) => domainRoutingMockActions.addDomain(host, options)}
          onClose={closeModal}
        />
      ),
      options: { width: 640, fakeModal: true },
    })

  return (
    <Section className="px-8 pb-8 pt-6">
      <div className="space-y-6">
        <SettingsHeading
          title="URLs"
          description="The public URLs this service answers on. Several services can share a domain, each on its own path."
        />
        <div className="max-w-content-with-navigation-left space-y-6">
          {!realService && (
            <Callout.Root color="neutral">
              <Callout.Icon>
                <Icon iconName="circle-info" iconStyle="regular" />
              </Callout.Icon>
              <Callout.TextDescription>
                Preview with sample data: this environment has fewer than 3 services, so the page shows the sample
                service “{service.name}”.
              </Callout.TextDescription>
            </Callout.Root>
          )}
          {service.status === 'STOPPED' && (
            <Callout.Root color="yellow">
              <Callout.Icon>
                <Icon iconName="circle-pause" iconStyle="regular" />
              </Callout.Icon>
              <Callout.TextHeading>
                This service is stopped: its paths return 503, the other paths of the domain keep working.
              </Callout.TextHeading>
            </Callout.Root>
          )}

          <BlockContent title={`${service.name} answers on`} classNameContent="p-0">
            {serviceRoutes.length === 0 && <p className="px-4 py-6 text-sm text-neutral-subtle">No public URL yet.</p>}
            {serviceRoutes.map(({ domain, route }) => {
              const sharedWith = domain.routes.filter((r) => r.serviceId !== service.id)
              const { sample, received } = receivedPath(route)
              return editing === route.id ? (
                <div key={route.id} className="p-3">
                  <RouteForm
                    domain={domain}
                    services={services}
                    route={route}
                    lockedServiceId={service.id}
                    onSave={(next) => {
                      domainRoutingMockActions.saveRoute(domain.id, next)
                      setEditing(null)
                    }}
                    onCancel={() => setEditing(null)}
                  />
                </div>
              ) : (
                <div
                  key={route.id}
                  className="flex items-start justify-between gap-4 border-b border-neutral px-4 py-3 last:border-0"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-code text-sm text-neutral">
                      https://{domain.host}
                      <strong>{route.path === '/' ? '' : route.path}</strong>
                      <span className="text-neutral-subtle"> → port {route.port}</span>
                    </span>
                    <span className="text-xs text-neutral-subtle">
                      Your app receives <code>{received}</code> for <code>{sample}</code> · timeout {route.timeoutSec}s
                    </span>
                    {sharedWith.length > 0 && (
                      <span className="text-xs text-neutral-subtle">
                        <Icon iconName="share-nodes" iconStyle="regular" className="mr-1" />
                        Shared with{' '}
                        {sharedWith
                          .map((r) => `${services.find((s) => s.id === r.serviceId)?.name} (${r.path})`)
                          .join(', ')}
                        .{' '}
                        <Link
                          to="/organization/$organizationId/project/$projectId/environment/$environmentId/domains"
                          params={{ organizationId, projectId, environmentId }}
                          className="text-brand underline"
                        >
                          See the routing table
                        </Link>
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button size="xs" variant="plain" color="neutral" onClick={() => setEditing(route.id)}>
                      Edit
                    </Button>
                    <Button
                      size="xs"
                      variant="plain"
                      color="neutral"
                      onClick={() => domainRoutingMockActions.removeRoute(domain.id, route.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )
            })}
          </BlockContent>

          <BlockContent title="Add a URL">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <InputSelectSmall
                  name="domain"
                  ariaLabel="Domain"
                  className="w-64"
                  defaultValue={targetDomain?.id}
                  items={domains.map((d) => ({ value: d.id, label: d.host }))}
                  onChange={(value) => setTargetDomainId(value)}
                />
                <span className="text-xs text-neutral-subtle">or</span>
                <Button size="md" variant="outline" color="neutral" onClick={openAddDomainModal}>
                  New domain
                  <Icon iconName="circle-plus" iconStyle="regular" />
                </Button>
              </div>
              {targetDomain && (
                <RouteForm
                  key={targetDomain.id}
                  domain={targetDomain}
                  services={services}
                  lockedServiceId={service.id}
                  onSave={(next) => domainRoutingMockActions.saveRoute(targetDomain.id, next)}
                />
              )}
            </div>
          </BlockContent>
        </div>
      </div>
    </Section>
  )
}

export default ServiceUrls
