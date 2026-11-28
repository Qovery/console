import { type OrganizationCustomDomainCheckResponse } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'

export const DOMAIN_DNS_STATUSES = ['failing', 'unknown', 'valid'] as const
export type DomainDnsStatus = (typeof DOMAIN_DNS_STATUSES)[number]

export interface DomainDnsStatusResult {
  status: DomainDnsStatus
  details: string[]
}

type ServiceCheck = OrganizationCustomDomainCheckResponse['checks'][number]

const isPassingCheck = ({ status }: ServiceCheck) =>
  match(status)
    .with('RESOLVES_TO_IP', 'MATCHES_LOAD_BALANCER_HOST', () => true)
    .otherwise(() => false)

// A domain is served by one or several services: it is valid only when the check of every service passes.
// A `null` status means the check could not run, which makes the domain unknown rather than failing.
export function getDomainDnsStatus(result: OrganizationCustomDomainCheckResponse | undefined): DomainDnsStatusResult {
  const checks = result?.checks ?? []
  const failing = checks.filter((check) => check.status !== null && !isPassingCheck(check))
  if (failing.length) {
    return { status: 'failing', details: failing.map((check) => check.error_details || check.status || '') }
  }
  const notRun = checks.filter((check) => check.status === null)
  if (!checks.length || notRun.length) {
    return { status: 'unknown', details: notRun.flatMap((check) => (check.error_details ? [check.error_details] : [])) }
  }
  return { status: 'valid', details: [] }
}

export function summarizeDomainDnsStatuses(statuses: (DomainDnsStatusResult | undefined)[]) {
  let valid = 0
  let failing = 0
  let unknown = 0
  for (const result of statuses) {
    if (result?.status === 'failing') failing++
    else if (result?.status === 'valid') valid++
    else unknown++
  }
  return { valid, failing, unknown }
}
