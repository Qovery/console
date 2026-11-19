import { type OrganizationCustomDomainResponse } from 'qovery-typescript-axios'

// A service domain can serve several routes. Mutate/check each service configuration once.
export function getDomainTargets(domain: OrganizationCustomDomainResponse) {
  const seen = new Set<string>()
  return domain.routes.flatMap((route) => {
    const type = route.service.type
    if (type !== 'APPLICATION' && type !== 'CONTAINER' && type !== 'HELM') return []
    const key = `${route.service.id}:${route.custom_domain_id}`
    if (seen.has(key)) return []
    seen.add(key)
    return [{ ...route, service: { ...route.service, type } }]
  })
}
