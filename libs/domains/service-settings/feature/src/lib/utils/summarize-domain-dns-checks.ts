import { type CheckedCustomDomainResponse, type OrganizationCustomDomainResponse } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { getDomainTargets } from './organization-domain-targets'

export const DOMAIN_DNS_STATUSES = ['failing', 'unknown', 'checking', 'valid'] as const
export type DomainDnsStatus = (typeof DOMAIN_DNS_STATUSES)[number]

const isFailingCheck = ({ status }: CheckedCustomDomainResponse) =>
  match(status)
    .with('RESOLVES_TO_IP', 'MATCHES_LOAD_BALANCER_HOST', () => false)
    .otherwise(() => true)

// A domain is served by one or several services; its DNS is valid only when every service check for it passes.
export function getDomainDnsStatus(
  domain: OrganizationCustomDomainResponse,
  serviceChecks: Map<string, CheckedCustomDomainResponse[] | undefined>,
  checkingServiceIds: ReadonlySet<string> = new Set()
): { status: DomainDnsStatus; details: string[] } {
  const services = [...new Set(getDomainTargets(domain).map(({ service }) => service.id))]
  if (services.some((id) => checkingServiceIds.has(id))) return { status: 'checking', details: [] }
  const checks = services.map((id) => serviceChecks.get(id)?.find((check) => check.domain_name === domain.domain))
  const failing = checks.filter((check): check is CheckedCustomDomainResponse =>
    Boolean(check && isFailingCheck(check))
  )
  if (failing.length) {
    return { status: 'failing', details: failing.map((check) => check.error_details || check.status) }
  }
  if (!checks.length || checks.some((check) => !check)) return { status: 'unknown', details: [] }
  return { status: 'valid', details: [] }
}

export function summarizeDomainDnsChecks(
  domains: OrganizationCustomDomainResponse[],
  serviceChecks: Map<string, CheckedCustomDomainResponse[] | undefined>
) {
  let valid = 0
  let failing = 0
  let unavailable = 0
  for (const domain of domains) {
    const { status } = getDomainDnsStatus(domain, serviceChecks)
    if (status === 'failing') failing++
    else if (status === 'valid') valid++
    else unavailable++
  }
  return { valid, failing, unavailable }
}
