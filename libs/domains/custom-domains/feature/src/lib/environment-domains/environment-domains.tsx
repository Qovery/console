import { useParams } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Badge,
  Button,
  Callout,
  Icon,
  InputSearch,
  TablePrimitives,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { AddDomainModal } from './add-domain-modal/add-domain-modal'
import {
  DOMAIN_ISSUE_COLORS,
  DOMAIN_ISSUE_LABELS,
  DomainIssueSummary,
} from './domain-issue-summary/domain-issue-summary'
import {
  DOMAIN_ISSUES,
  type DomainIssue,
  type DomainRoute,
  type RoutableService,
  type RoutedDomain,
  domainIssues,
  receivedPath,
  routeConflicts,
  sortRoutes,
} from './domain-routing'
import { RouteForm } from './route-form/route-form'
import {
  MOCK_CNAME_TARGET,
  MOCK_HOSTS_IN_OTHER_ENVIRONMENTS,
  domainRoutingMockActions,
  useDomainRoutingMock,
} from './use-domain-routing-mock'

const { Table } = TablePrimitives

// Past this many domains, rows start collapsed so the whole list fits on one screen.
const EXPAND_BY_DEFAULT_MAX = 5

const serviceName = (services: RoutableService[], id: string) => services.find((s) => s.id === id)?.name ?? 'Unknown'

export function CertificateBadge({ domain }: { domain: RoutedDomain }) {
  switch (domain.certificate) {
    case 'ISSUED':
      return (
        <Badge variant="surface" color="green" size="sm">
          <Icon iconName="lock" iconStyle="regular" className="mr-1" />
          TLS issued
        </Badge>
      )
    case 'PENDING':
      return (
        <Badge variant="surface" color="sky" size="sm">
          <Icon iconName="clock" iconStyle="regular" className="mr-1" />
          TLS pending
        </Badge>
      )
    case 'EXTERNAL':
      return (
        <Badge variant="surface" color="neutral" size="sm">
          <Icon iconName="shield" iconStyle="regular" className="mr-1" />
          TLS managed by {domain.useCdn ? 'your CDN' : 'you'}
        </Badge>
      )
  }
}

export function EnvironmentDomains() {
  const { environmentId = '' } = useParams({ strict: false })
  const { domains, services } = useDomainRoutingMock(environmentId)
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const [editing, setEditing] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [issueFilter, setIssueFilter] = useState<DomainIssue | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const search = query.trim().toLowerCase()
  const issuesById = Object.fromEntries(domains.map((d) => [d.id, domainIssues(d, services)]))
  const hostsByIssue = Object.fromEntries(
    DOMAIN_ISSUES.map((issue) => [issue, domains.filter((d) => issuesById[d.id].includes(issue)).map((d) => d.host)])
  ) as Record<DomainIssue, string[]>
  // A search matches the host, a path or a service name; matching routes narrow the table to those routes.
  const routeMatches = (route: DomainRoute) =>
    route.path.toLowerCase().includes(search) || serviceName(services, route.serviceId).toLowerCase().includes(search)
  const visibleDomains = domains.filter(
    (d) =>
      (!issueFilter || issuesById[d.id].includes(issueFilter)) &&
      (!search || d.host.toLowerCase().includes(search) || d.routes.some(routeMatches))
  )
  const isFiltering = Boolean(search) || Boolean(issueFilter)
  const isOpen = (d: RoutedDomain) =>
    isFiltering || editing === `${d.id}:new` || (expanded[d.id] ?? domains.length <= EXPAND_BY_DEFAULT_MAX)
  const setAllExpanded = (open: boolean) => setExpanded(Object.fromEntries(domains.map((d) => [d.id, open])))

  const openAddDomainModal = () =>
    openModal({
      content: (
        <AddDomainModal
          domains={domains}
          services={services}
          cnameTarget={MOCK_CNAME_TARGET}
          findHostOwner={(host) => MOCK_HOSTS_IN_OTHER_ENVIRONMENTS[host]}
          onSubmit={({ host, ...options }) => domainRoutingMockActions.addDomain(host, options)}
          onClose={closeModal}
        />
      ),
      options: { width: 640, fakeModal: true },
    })

  const confirmRemoveDomain = (domain: RoutedDomain) =>
    openModalConfirmation({
      title: 'Delete domain',
      confirmationMethod: 'action',
      name: domain.host,
      action: () => domainRoutingMockActions.removeDomain(domain.id),
    })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-neutral-subtle">
          One domain, one certificate, one routing table. The longest matching path wins.
        </p>
        <Button size="md" color="brand" onClick={openAddDomainModal}>
          Add domain
          <Icon iconName="circle-plus" iconStyle="regular" />
        </Button>
      </div>

      <DomainIssueSummary
        total={domains.length}
        hostsByIssue={hostsByIssue}
        onShowIssue={(issue) => {
          setQuery('')
          setIssueFilter(issue)
        }}
      />

      <div className="flex flex-wrap items-center gap-2">
        <InputSearch
          className="w-80"
          ariaLabel="Search domains"
          placeholder="Search a domain, a path or a service"
          value={query}
          onChange={setQuery}
        />
        <Button
          size="sm"
          variant={issueFilter ? 'outline' : 'surface'}
          color={issueFilter ? 'neutral' : 'brand'}
          onClick={() => setIssueFilter(null)}
        >
          All {domains.length}
        </Button>
        {DOMAIN_ISSUES.filter((issue) => hostsByIssue[issue].length > 0).map((issue) => (
          <Button
            key={issue}
            size="sm"
            variant={issueFilter === issue ? 'surface' : 'outline'}
            color={issueFilter === issue ? 'brand' : 'neutral'}
            onClick={() => setIssueFilter(issueFilter === issue ? null : issue)}
          >
            {DOMAIN_ISSUE_LABELS[issue]} {hostsByIssue[issue].length}
          </Button>
        ))}
        <div className="ml-auto flex gap-1">
          <Button size="sm" variant="plain" color="neutral" onClick={() => setAllExpanded(true)}>
            Expand all
          </Button>
          <Button size="sm" variant="plain" color="neutral" onClick={() => setAllExpanded(false)}>
            Collapse all
          </Button>
        </div>
      </div>

      {isFiltering && (
        <p className="text-xs text-neutral-subtle">
          {visibleDomains.length} of {domains.length} domains
        </p>
      )}
      {visibleDomains.length === 0 && domains.length > 0 && (
        <p className="py-10 text-center text-sm text-neutral-subtle">No domain matches your search.</p>
      )}

      {visibleDomains.map((domain) => {
        const open = isOpen(domain)
        const issues = issuesById[domain.id]
        const routes =
          search && !domain.host.toLowerCase().includes(search) ? domain.routes.filter(routeMatches) : domain.routes
        const targets = [...new Set(domain.routes.map((r) => serviceName(services, r.serviceId)))]
        return (
          <section key={domain.id} className="rounded border border-neutral">
            <div
              className={twMerge(
                'flex items-center justify-between gap-2 bg-surface-neutral-subtle px-4 py-3',
                open && 'border-b border-neutral'
              )}
            >
              <button
                type="button"
                aria-expanded={open}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
                onClick={() => setExpanded({ ...expanded, [domain.id]: !open })}
              >
                <Icon
                  iconName="chevron-right"
                  className={twMerge('text-xs text-neutral-subtle', open && 'rotate-90')}
                />
                <span className="text-sm font-medium text-neutral">{domain.host}</span>
                <CertificateBadge domain={domain} />
                {!open && (
                  <span className="truncate text-xs text-neutral-subtle">
                    {domain.routes.length} route{domain.routes.length === 1 ? '' : 's'}
                    {targets.length > 0 && ` · ${targets.join(', ')}`}
                  </span>
                )}
                {!open &&
                  issues
                    .filter((issue) => issue !== 'tls-pending')
                    .map((issue) => (
                      <Badge key={issue} variant="surface" color={DOMAIN_ISSUE_COLORS[issue]} size="sm">
                        {DOMAIN_ISSUE_LABELS[issue]}
                      </Badge>
                    ))}
              </button>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" color="neutral" onClick={() => setEditing(`${domain.id}:new`)}>
                  Add route
                  <Icon iconName="plus" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  color="neutral"
                  iconOnly
                  aria-label={`Delete ${domain.host}`}
                  onClick={() => confirmRemoveDomain(domain)}
                >
                  <Icon iconName="trash-can" iconStyle="regular" />
                </Button>
              </div>
            </div>

            {open && (
              <div className="flex flex-col">
                {issues.includes('conflict') && (
                  <Callout.Root color="red" className="m-3 mb-0">
                    <Callout.Icon>
                      <Icon iconName="triangle-exclamation" iconStyle="regular" />
                    </Callout.Icon>
                    <Callout.TextHeading>
                      Two services claim the same path. Deployment is blocked until one is changed.
                    </Callout.TextHeading>
                  </Callout.Root>
                )}
                {domain.routes.length === 0 && editing !== `${domain.id}:new` ? (
                  <p className="py-4 text-center text-sm text-neutral-subtle">
                    No route yet. Requests to {domain.host} return 404.
                  </p>
                ) : (
                  // Flush with the domain card: one border, not a table inside a table.
                  <Table.Root className="w-full" containerClassName="rounded-none border-0 bg-transparent">
                    <Table.Header>
                      <Table.Row className="text-xs text-neutral-subtle">
                        <Table.ColumnHeaderCell className="h-9 font-sans font-medium">Path</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell className="h-9 font-sans font-medium">Service</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell className="h-9 font-sans font-medium">
                          Your app receives
                        </Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell className="h-9 font-sans font-medium">Timeout</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell className="h-9">
                          <span className="sr-only">Actions</span>
                        </Table.ColumnHeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {sortRoutes(routes).map((route) =>
                        editing === route.id ? (
                          <Table.Row key={route.id}>
                            <Table.Cell colSpan={5} className="py-3">
                              <RouteForm
                                domain={domain}
                                services={services}
                                route={route}
                                onSave={(next) => {
                                  domainRoutingMockActions.saveRoute(domain.id, next)
                                  setEditing(null)
                                }}
                                onCancel={() => setEditing(null)}
                              />
                            </Table.Cell>
                          </Table.Row>
                        ) : (
                          <RouteRow
                            key={route.id}
                            domain={domain}
                            route={route}
                            services={services}
                            onEdit={() => setEditing(route.id)}
                          />
                        )
                      )}
                    </Table.Body>
                  </Table.Root>
                )}
                {editing === `${domain.id}:new` && (
                  <div className="border-t border-neutral p-3">
                    <RouteForm
                      domain={domain}
                      services={services}
                      onSave={(next) => {
                        domainRoutingMockActions.saveRoute(domain.id, next)
                        setEditing(null)
                      }}
                      onCancel={() => setEditing(null)}
                    />
                  </div>
                )}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

interface RouteRowProps {
  domain: RoutedDomain
  route: DomainRoute
  services: RoutableService[]
  onEdit: () => void
}

function RouteRow({ domain, route, services, onEdit }: RouteRowProps) {
  const hasConflict = routeConflicts(domain, route).length > 0
  const { sample, received } = receivedPath(route)
  const service = services.find((s) => s.id === route.serviceId)
  return (
    <Table.Row className={twMerge(hasConflict && 'bg-surface-negative-subtle')}>
      <Table.Cell className="font-code">{route.path}</Table.Cell>
      <Table.Cell>
        <div className="flex flex-col">
          <span>
            {service?.name ?? 'Unknown'} <span className="text-neutral-subtle">:{route.port}</span>
          </span>
          {service?.status === 'STOPPED' && (
            <span className="text-xs text-warning">
              <Icon iconName="circle-pause" iconStyle="regular" className="mr-1" />
              Stopped, returns 503
            </span>
          )}
        </div>
      </Table.Cell>
      <Table.Cell className="text-xs text-neutral-subtle">
        <code>{sample}</code> → <code className="text-neutral">{received}</code>
      </Table.Cell>
      <Table.Cell className="text-neutral-subtle">{route.timeoutSec}s</Table.Cell>
      <Table.Cell className="text-right">
        <Button size="xs" variant="plain" color="neutral" onClick={onEdit}>
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
      </Table.Cell>
    </Table.Row>
  )
}

export default EnvironmentDomains
