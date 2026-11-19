import { type CheckedCustomDomainResponse, type OrganizationCustomDomainResponse } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { getDomainTargets } from './organization-domain-targets'

export function summarizeDomainDnsChecks(
  domains: OrganizationCustomDomainResponse[],
  serviceChecks: Map<string, CheckedCustomDomainResponse[] | undefined>
) {
  let valid = 0
  let failing = 0
  let unavailable = 0
  for (const domain of domains) {
    const services = [...new Set(getDomainTargets(domain).map(({ service }) => service.id))]
    const checks = services.map((id) => serviceChecks.get(id)?.find((check) => check.domain_name === domain.domain))
    if (
      checks.some(
        (check) =>
          check &&
          match(check.status)
            .with('RESOLVES_TO_IP', 'MATCHES_LOAD_BALANCER_HOST', () => false)
            .otherwise(() => true)
      )
    )
      failing++
    else if (!checks.length || checks.some((check) => !check)) unavailable++
    else valid++
  }
  return { valid, failing, unavailable }
}
