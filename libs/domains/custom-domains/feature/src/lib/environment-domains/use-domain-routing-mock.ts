// Mock data for the environment Domains design review. There is no routing API yet: the routes live in memory
// and reset on reload. Add `?domains=30` to the URL to preview an environment with many domains.
import { useSearch } from '@tanstack/react-router'
import { useEffect, useSyncExternalStore } from 'react'
import { useServices } from '@qovery/domains/services/feature'
import { type DomainRoute, type RoutableService, type RoutedDomain } from './domain-routing'

// The environment load balancer, shared by every domain of the environment.
export const MOCK_CNAME_TARGET = 'z8f3a91c2-zb2e4c1d7.eu-west-3.qovery.io'

// Hosts already attached to another environment, to show the ownership check.
export const MOCK_HOSTS_IN_OTHER_ENVIRONMENTS: Record<string, string> = {
  'api.acme.com': 'production',
  'www.acme.io': 'marketing / staging',
}

interface MockState {
  seededFor?: string
  domains: RoutedDomain[]
  services: RoutableService[]
}

let state: MockState = { domains: [], services: [] }
const listeners = new Set<() => void>()
const setState = (next: MockState) => {
  state = next
  listeners.forEach((listener) => listener())
}

let sequence = 0
const uid = (prefix: string) => `${prefix}-${++sequence}`

const FALLBACK_SERVICES: RoutableService[] = [
  { id: 'svc-front', name: 'frontend', ports: [3000], status: 'RUNNING' },
  { id: 'svc-api', name: 'backend-api', ports: [8080, 9090], status: 'RUNNING' },
  { id: 'svc-cable', name: 'anycable', ports: [8081], status: 'STOPPED' },
  { id: 'svc-worker', name: 'worker', ports: [], status: 'RUNNING' },
]

const EXTRA_SERVICES: RoutableService[] = [
  { id: 'svc-shop', name: 'shop', ports: [3000], status: 'RUNNING' },
  { id: 'svc-blog', name: 'blog', ports: [2368], status: 'RUNNING' },
  { id: 'svc-docs', name: 'docs', ports: [8000], status: 'RUNNING' },
  { id: 'svc-auth', name: 'auth', ports: [9000], status: 'RUNNING' },
  { id: 'svc-billing', name: 'billing', ports: [8080], status: 'STOPPED' },
  { id: 'svc-grafana', name: 'grafana', ports: [3000], status: 'RUNNING' },
  { id: 'svc-tenant', name: 'tenant-app', ports: [8080], status: 'RUNNING' },
]

const EXTRA_HOSTS = [
  'www.acme.com',
  'acme.com',
  'shop.acme.com',
  'blog.acme.com',
  'docs.acme.com',
  'auth.acme.com',
  'status.acme.com',
  'grafana.internal.acme.com',
  'eu.api.acme.com',
  'us.api.acme.com',
  'billing.acme.com',
  'partners.acme.com',
  'm.acme.com',
  'cdn-origin.acme.com',
  'acme.fr',
  'acme.de',
  ...Array.from({ length: 30 }, (_, i) => `tenant-${String(i + 1).padStart(2, '0')}.acme-app.com`),
]

const route = (path: string, service: RoutableService, extra: Partial<DomainRoute> = {}): DomainRoute => ({
  id: uid('route'),
  path,
  serviceId: service.id,
  port: service.ports[0] ?? 80,
  stripPrefix: false,
  timeoutSec: 60,
  ...extra,
})

// Deterministic shapes: one route, a static split, the front/api/cable split, plus one conflict and one empty domain.
function extraRoutes(index: number, services: RoutableService[]): DomainRoute[] {
  // Only running targets, so stopped services stay a rare issue in the preview rather than half the list.
  const exposable = services.filter((s) => s.ports.length > 0 && s.status === 'RUNNING')
  const pick = (k: number) => exposable[(index * 7 + k * 3) % exposable.length]
  const strip = index % 2 === 0
  switch (index % 5) {
    case 0:
      return [
        route('/', pick(0)),
        route('/api', pick(1), { stripPrefix: strip }),
        route('/cable', pick(2), { timeoutSec: 3600 }),
      ]
    case 2:
      return [route('/', pick(0)), route('/static', pick(1), { stripPrefix: strip })]
    case 3:
      return index === 13 ? [] : [route('/', pick(0)), route('/admin', pick(1)), route('/webhooks', pick(2))]
    case 4:
      return index === 9 ? [route('/', pick(0)), route('/', pick(1))] : [route('/', pick(0))]
    default:
      return [route('/', pick(0))]
  }
}

function seed(environmentId: string, realServices: { id: string; name: string }[], domainCount: number) {
  const key = `${environmentId}:${domainCount}`
  if (state.seededFor === key) return
  // Real service names make the review feel real; ports and status are invented.
  const base: RoutableService[] =
    realServices.length >= 3
      ? realServices.map((s, i) => ({
          id: s.id,
          name: s.name,
          ports: i === 3 ? [] : [[3000], [8080, 9090], [8081]][i % 3],
          status: i === 2 ? 'STOPPED' : 'RUNNING',
        }))
      : FALLBACK_SERVICES
  const services = domainCount > 2 ? [...base, ...EXTRA_SERVICES] : base
  const [front, api, cable, worker] = services
  const domains: RoutedDomain[] = [
    {
      id: uid('domain'),
      host: 'app.acme.com',
      certificate: 'ISSUED',
      routes: [
        route('/', front),
        route('/api', api, { rewriteTo: '/v2' }),
        route('/cable', cable, { timeoutSec: 3600 }),
      ],
    },
    {
      id: uid('domain'),
      host: 'admin.acme.com',
      certificate: 'PENDING',
      routes: [route('/', api, { port: 9090 }), ...(worker ? [route('/', worker, { port: 80 })] : [])],
    },
    ...EXTRA_HOSTS.slice(0, Math.max(0, domainCount - 2)).map(
      (host, index): RoutedDomain => ({
        id: uid('domain'),
        host,
        certificate: index % 6 === 4 ? 'PENDING' : 'ISSUED',
        routes: extraRoutes(index, services),
      })
    ),
  ]
  setState({ seededFor: key, services, domains })
}

export function useDomainRoutingMock(environmentId: string) {
  const { data: realServices = [] } = useServices({ environmentId })
  const { domains: domainsParam } = useSearch({ strict: false }) as { domains?: number | string }
  const domainCount = Number(domainsParam) || 2

  useEffect(() => {
    seed(environmentId, realServices, domainCount)
  }, [environmentId, realServices, domainCount])

  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => state
  )
}

export const domainRoutingMockActions = {
  addDomain(
    host: string,
    {
      generateCertificate = true,
      useCdn = false,
      routes = [],
    }: {
      generateCertificate?: boolean
      useCdn?: boolean
      routes?: Omit<DomainRoute, 'id'>[]
    } = {}
  ) {
    const domain: RoutedDomain = {
      id: uid('domain'),
      host,
      certificate: generateCertificate ? 'PENDING' : 'EXTERNAL',
      useCdn,
      routes: routes.map((r) => ({ ...r, id: uid('route') })),
    }
    setState({ ...state, domains: [...state.domains, domain] })
  },
  removeDomain(domainId: string) {
    setState({ ...state, domains: state.domains.filter((d) => d.id !== domainId) })
  },
  saveRoute(domainId: string, next: Omit<DomainRoute, 'id'> & { id?: string }) {
    setState({
      ...state,
      domains: state.domains.map((d) => {
        if (d.id !== domainId) return d
        const routes = next.id
          ? d.routes.map((r) => (r.id === next.id ? { ...r, ...next, id: r.id } : r))
          : [...d.routes, { ...next, id: uid('route') }]
        return { ...d, routes }
      }),
    })
  },
  removeRoute(domainId: string, routeId: string) {
    setState({
      ...state,
      domains: state.domains.map((d) =>
        d.id === domainId ? { ...d, routes: d.routes.filter((r) => r.id !== routeId) } : d
      ),
    })
  },
}
