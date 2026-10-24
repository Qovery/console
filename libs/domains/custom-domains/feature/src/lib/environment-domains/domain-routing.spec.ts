import {
  type DomainRoute,
  type RoutedDomain,
  domainIssues,
  normalizePath,
  receivedPath,
  routeConflicts,
  sortRoutes,
} from './domain-routing'

const route = (overrides: Partial<DomainRoute>): DomainRoute => ({
  id: 'r',
  path: '/',
  serviceId: 'front',
  port: 3000,
  stripPrefix: false,
  timeoutSec: 60,
  ...overrides,
})

const domain = (routes: DomainRoute[], overrides: Partial<RoutedDomain> = {}): RoutedDomain => ({
  id: 'd',
  host: 'app.acme.com',
  certificate: 'ISSUED',
  routes,
  ...overrides,
})

describe('normalizePath', () => {
  it('adds the leading slash and drops trailing ones', () => {
    expect(normalizePath('api/')).toBe('/api')
    expect(normalizePath('/')).toBe('/')
  })
})

describe('sortRoutes', () => {
  it('puts the longest prefix first', () => {
    const sorted = sortRoutes([
      route({ id: '1', path: '/' }),
      route({ id: '2', path: '/api/v2' }),
      route({ id: '3', path: '/api' }),
    ])
    expect(sorted.map((r) => r.path)).toEqual(['/api/v2', '/api', '/'])
  })
})

describe('receivedPath', () => {
  it('forwards the path as is by default', () => {
    expect(receivedPath(route({ path: '/api' }))).toEqual({ sample: '/api/users', received: '/api/users' })
  })

  it('removes the prefix', () => {
    expect(receivedPath(route({ path: '/api', stripPrefix: true })).received).toBe('/users')
  })

  it('never strips the root path', () => {
    expect(receivedPath(route({ path: '/', stripPrefix: true })).received).toBe('/users')
  })

  it('replaces the prefix, and the replacement wins over stripPrefix', () => {
    expect(receivedPath(route({ path: '/api', rewriteTo: '/v2', stripPrefix: true })).received).toBe('/v2/users')
    expect(receivedPath(route({ path: '/', rewriteTo: '/app' })).received).toBe('/app/users')
  })
})

describe('routeConflicts', () => {
  it('detects two routes on the same normalized path', () => {
    const d = domain([route({ id: '1', path: '/api' }), route({ id: '2', path: '/api/', serviceId: 'back' })])
    expect(routeConflicts(d, d.routes[0]).map((r) => r.id)).toEqual(['2'])
  })
})

describe('domainIssues', () => {
  const services = [
    { id: 'front', name: 'frontend', ports: [3000], status: 'RUNNING' as const },
    { id: 'cable', name: 'anycable', ports: [8081], status: 'STOPPED' as const },
  ]

  it('returns nothing for a healthy domain', () => {
    expect(domainIssues(domain([route({})]), services)).toEqual([])
  })

  it('reports issues in fixing order', () => {
    const d = domain([route({ id: '1' }), route({ id: '2', serviceId: 'cable' })], { certificate: 'PENDING' })
    expect(domainIssues(d, services)).toEqual(['conflict', 'stopped-target', 'tls-pending'])
  })

  it('flags a domain without routes', () => {
    expect(domainIssues(domain([]), services)).toEqual(['no-route'])
  })
})
