export interface DomainRoute {
  id: string
  path: string
  serviceId: string
  port: number
  stripPrefix: boolean
  // When set, the matched prefix is replaced by this path (e.g. /api -> /v2). Takes precedence over stripPrefix.
  rewriteTo?: string
  timeoutSec: number
}

export interface RoutedDomain {
  id: string
  host: string
  certificate: 'ISSUED' | 'PENDING' | 'EXTERNAL'
  useCdn?: boolean
  routes: DomainRoute[]
}

export interface RoutableService {
  id: string
  name: string
  ports: number[]
  status: 'RUNNING' | 'STOPPED'
}

export type RewriteMode = 'keep' | 'strip' | 'rewrite'

export type DomainIssue = 'conflict' | 'no-route' | 'stopped-target' | 'tls-pending'

// Ordered by how urgently they must be fixed.
export const DOMAIN_ISSUES: DomainIssue[] = ['conflict', 'no-route', 'stopped-target', 'tls-pending']

export const normalizePath = (path: string) => {
  const withSlash = path.startsWith('/') ? path : `/${path}`
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, '') : withSlash
}

// Longest prefix first, the order in which Gateway API evaluates PathPrefix matches.
export const sortRoutes = (routes: DomainRoute[]) => [...routes].sort((a, b) => b.path.length - a.path.length)

export const routeConflicts = (domain: RoutedDomain, route: Pick<DomainRoute, 'id' | 'path'>) =>
  domain.routes.filter((r) => r.id !== route.id && normalizePath(r.path) === normalizePath(route.path))

export const rewriteModeOf = (route: Pick<DomainRoute, 'stripPrefix' | 'rewriteTo'>): RewriteMode =>
  route.rewriteTo !== undefined ? 'rewrite' : route.stripPrefix ? 'strip' : 'keep'

// Shows what the service receives for a sample request, so the rewrite choice is never abstract.
export function receivedPath(route: Pick<DomainRoute, 'path' | 'stripPrefix' | 'rewriteTo'>) {
  const sample = route.path === '/' ? '/users' : `${route.path}/users`
  const rest = route.path === '/' ? sample : sample.slice(route.path.length)
  const mode = rewriteModeOf(route)
  if (mode === 'rewrite')
    return { sample, received: `${normalizePath(route.rewriteTo || '/').replace(/\/$/, '')}${rest}` }
  if (mode === 'strip' && route.path !== '/') return { sample, received: rest }
  return { sample, received: sample }
}

export const routesForService = (domains: RoutedDomain[], serviceId: string) =>
  domains.flatMap((domain) =>
    domain.routes.filter((route) => route.serviceId === serviceId).map((route) => ({ domain, route }))
  )

export function domainIssues(domain: RoutedDomain, services: RoutableService[]): DomainIssue[] {
  const isStopped = (route: DomainRoute) => services.find((s) => s.id === route.serviceId)?.status === 'STOPPED'
  const hasIssue: Record<DomainIssue, boolean> = {
    conflict: domain.routes.some((route) => routeConflicts(domain, route).length > 0),
    'no-route': domain.routes.length === 0,
    'stopped-target': domain.routes.some(isStopped),
    'tls-pending': domain.certificate === 'PENDING',
  }
  return DOMAIN_ISSUES.filter((issue) => hasIssue[issue])
}
