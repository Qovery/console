import { type OrganizationCustomDomainCheckResponse } from 'qovery-typescript-axios'
import { getDomainDnsStatus, summarizeDomainDnsStatuses } from './summarize-domain-dns-checks'

type ServiceCheck = OrganizationCustomDomainCheckResponse['checks'][number]

const check = (
  service_id: string,
  status: ServiceCheck['status'],
  error_details: string | null = null
): ServiceCheck => ({ service_id, service_type: 'APPLICATION', status, error_details })
const result = (checks: ServiceCheck[]): OrganizationCustomDomainCheckResponse => ({
  environment_id: 'env',
  domain: 'app.example.com',
  checks,
})

describe('getDomainDnsStatus', () => {
  it('is valid when every service check passes', () => {
    expect(
      getDomainDnsStatus(result([check('web', 'MATCHES_LOAD_BALANCER_HOST'), check('api', 'RESOLVES_TO_IP')]))
    ).toEqual({ status: 'valid', details: [] })
  })

  it('is failing when one service check fails, with its details or status', () => {
    expect(
      getDomainDnsStatus(
        result([
          check('web', 'MATCHES_LOAD_BALANCER_HOST'),
          check('api', 'DOMAIN_LINKED_TO_WRONG_HOST', 'Wrong CNAME'),
          check('worker', 'DOMAIN_NOT_CONFIGURED'),
        ])
      )
    ).toEqual({ status: 'failing', details: ['Wrong CNAME', 'DOMAIN_NOT_CONFIGURED'] })
  })

  it('prefers failing over a check that could not run', () => {
    expect(
      getDomainDnsStatus(result([check('web', 'GENERIC_FAILURE', 'Lookup failed'), check('api', null, 'Timeout')]))
    ).toEqual({ status: 'failing', details: ['Lookup failed'] })
  })

  it('is unknown with the reason when a check could not run', () => {
    expect(
      getDomainDnsStatus(
        result([check('web', 'MATCHES_LOAD_BALANCER_HOST'), check('api', null, 'Cluster unreachable')])
      )
    ).toEqual({ status: 'unknown', details: ['Cluster unreachable'] })
  })

  it('is unknown when no service could be checked or the domain has no result', () => {
    expect(getDomainDnsStatus(result([]))).toEqual({ status: 'unknown', details: [] })
    expect(getDomainDnsStatus(undefined)).toEqual({ status: 'unknown', details: [] })
  })
})

it('summarizes statuses, counting missing ones as unknown', () => {
  expect(
    summarizeDomainDnsStatuses([
      { status: 'valid', details: [] },
      { status: 'failing', details: [] },
      { status: 'unknown', details: [] },
      undefined,
    ])
  ).toEqual({ valid: 1, failing: 1, unknown: 2 })
})
