import { type CheckedCustomDomainResponse, type OrganizationCustomDomainResponse } from 'qovery-typescript-axios'
import { getDomainDnsStatus, summarizeDomainDnsChecks } from './summarize-domain-dns-checks'

const route = (serviceId: string) => ({
  id: `route-${serviceId}`,
  custom_domain_id: `domain-${serviceId}`,
  service: { id: serviceId, name: serviceId, type: 'APPLICATION' as const },
  port: null,
  path: '/',
  path_rewrite: null,
})
const domain = (name: string, serviceIds: string[]): OrganizationCustomDomainResponse => ({
  domain: name,
  environment_id: 'env',
  project: { id: 'project', name: 'project' },
  environment: { id: 'env', name: 'production', routing_mode: 'PER_HOSTNAME_LISTENER_SET' },
  generate_certificate: true,
  use_cdn: false,
  routes: serviceIds.map(route),
})
const check = (
  domain_name: string,
  status: CheckedCustomDomainResponse['status'],
  error_details?: string
): CheckedCustomDomainResponse => ({ domain_name, status, error_details })

describe('getDomainDnsStatus', () => {
  it('is valid when every service check passes', () => {
    const checks = new Map([
      ['web', [check('app.example.com', 'MATCHES_LOAD_BALANCER_HOST')]],
      ['api', [check('app.example.com', 'RESOLVES_TO_IP')]],
    ])
    expect(getDomainDnsStatus(domain('app.example.com', ['web', 'api']), checks)).toEqual({
      status: 'valid',
      details: [],
    })
  })

  it('is failing when one service check fails, with its details or status', () => {
    const checks = new Map([
      ['web', [check('app.example.com', 'DOMAIN_LINKED_TO_WRONG_HOST', 'Points to another host')]],
      ['api', [check('app.example.com', 'DOMAIN_NOT_CONFIGURED')]],
    ])
    expect(getDomainDnsStatus(domain('app.example.com', ['web', 'api']), checks)).toEqual({
      status: 'failing',
      details: ['Points to another host', 'DOMAIN_NOT_CONFIGURED'],
    })
  })

  it('is unknown when a check is missing', () => {
    const checks = new Map([['web', [check('other.example.com', 'RESOLVES_TO_IP')]]])
    expect(getDomainDnsStatus(domain('app.example.com', ['web']), checks).status).toBe('unknown')
  })
})

it('summarizes statuses for the bulk DNS check', () => {
  const checks = new Map([
    ['web', [check('a.example.com', 'RESOLVES_TO_IP'), check('b.example.com', 'GENERIC_FAILURE')]],
  ])
  expect(
    summarizeDomainDnsChecks(
      [domain('a.example.com', ['web']), domain('b.example.com', ['web']), domain('c.example.com', ['web'])],
      checks
    )
  ).toEqual({ valid: 1, failing: 1, unavailable: 1 })
})
