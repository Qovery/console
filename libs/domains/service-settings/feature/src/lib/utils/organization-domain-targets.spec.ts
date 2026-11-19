import { type OrganizationCustomDomainResponse } from 'qovery-typescript-axios'
import { getDomainSelectionKey, getDomainTargets, getSelectedDomainTargets } from './organization-domain-targets'
import { summarizeDomainDnsChecks } from './summarize-domain-dns-checks'

const domain: OrganizationCustomDomainResponse = {
  domain: 'app.example.com',
  environment_id: 'env-1',
  project: { id: 'project-1', name: 'Project' },
  environment: { id: 'env-1', name: 'production', routing_mode: 'PER_HOSTNAME_LISTENER_SET' },
  generate_certificate: true,
  use_cdn: false,
  routes: [
    {
      id: 'route-1',
      custom_domain_id: 'domain-1',
      service: { id: 'app-1', name: 'web', type: 'APPLICATION' },
      port: null,
      path: '/',
      path_rewrite: null,
    },
  ],
}

describe('getDomainTargets', () => {
  it('deduplicates service configurations serving several paths', () => {
    const route = domain.routes[0]
    expect(getDomainTargets({ ...domain, routes: [route, { ...route, id: 'route-2', path: '/api' }] })).toHaveLength(1)
  })
  it('preserves separate services and configurations', () => {
    const route = domain.routes[0]
    expect(
      getDomainTargets({
        ...domain,
        routes: [
          route,
          {
            ...route,
            id: 'route-2',
            custom_domain_id: 'domain-2',
            service: { id: 'app-2', name: 'api', type: 'CONTAINER' },
          },
        ],
      })
    ).toHaveLength(2)
  })
  it('ignores unsupported service types', () => {
    expect(
      getDomainTargets({
        ...domain,
        routes: [{ ...domain.routes[0], service: { id: 'db', name: 'db', type: 'DATABASE' } }],
      })
    ).toEqual([])
  })
  it('accepts domains without routes', () => {
    expect(getDomainTargets({ ...domain, routes: [] })).toEqual([])
  })
})

it('keeps identical domain names in different environments independently selectable', () => {
  expect(getDomainSelectionKey(domain)).not.toBe(getDomainSelectionKey({ ...domain, environment_id: 'other-env' }))
})
it('deduplicates repeated configurations across a domain selection', () => {
  expect(getSelectedDomainTargets([domain, domain])).toHaveLength(1)
})

it('uses DNS status even when the API omits failure details', () => {
  expect(
    summarizeDomainDnsChecks(
      [domain],
      new Map([['app-1', [{ domain_name: domain.domain, status: 'DOMAIN_NOT_CONFIGURED' }]]])
    )
  ).toEqual({ valid: 0, failing: 1, unavailable: 0 })
})
it('requires a DNS result from every service serving a selected domain', () => {
  const multiService = {
    ...domain,
    routes: [...domain.routes, { ...domain.routes[0], service: { ...domain.routes[0].service, id: 'app-2' } }],
  }
  expect(
    summarizeDomainDnsChecks(
      [multiService],
      new Map([['app-1', [{ domain_name: domain.domain, status: 'RESOLVES_TO_IP' }]]])
    )
  ).toEqual({ valid: 0, failing: 0, unavailable: 1 })
})
