import { QUERY_CERTIFICATE_RENEWAL_FAILED, QUERY_CPU, QUERY_MEMORY } from './alert-queries'

describe('alert queries', () => {
  it('should deduplicate CPU usage series before matching resource requests', () => {
    expect(QUERY_CPU('app-container')).toContain(
      'max by (pod, namespace, container) (rate(container_cpu_usage_seconds_total{container="app-container"}[1m]))'
    )
  })

  it('should deduplicate memory usage series before matching resource requests', () => {
    expect(QUERY_MEMORY('app-container')).toContain(
      'max by (pod, namespace, container) (container_memory_working_set_bytes{container="app-container"})'
    )
  })

  it('should scope certificate renewal failures to the selected service ownership labels', () => {
    const query = QUERY_CERTIFICATE_RENEWAL_FAILED('service-123')

    const selectors = [...query.matchAll(/(kube_certmanager_certificate_\w+)\{([^}]+)\}/g)]
    expect(selectors).toHaveLength(9)
    for (const [, , labels] of selectors) {
      expect(labels).toContain('qovery_com_associated_service_id="service-123"')
    }
    expect(selectors.filter(([, metric]) => metric.endsWith('renewal_timestamp_seconds'))).toHaveLength(6)
    expect(selectors.filter(([, metric]) => metric.endsWith('expiration_timestamp_seconds'))).toHaveLength(1)
  })

  it('should require a scheduled renewal overdue by one hour in every failure branch', () => {
    const branches = QUERY_CERTIFICATE_RENEWAL_FAILED('service-123').split('or on (namespace, name)')
    expect(branches).toHaveLength(3)
    for (const branch of branches) {
      expect(branch).toContain(
        'kube_certmanager_certificate_renewal_timestamp_seconds{qovery_com_associated_service_id="service-123"} > 0'
      )
      expect(branch).toContain(
        'time() - kube_certmanager_certificate_renewal_timestamp_seconds{qovery_com_associated_service_id="service-123"} > 3600'
      )
    }
  })

  it('should count matching certificates so a false Ready gauge contributes a positive alert value', () => {
    const query = QUERY_CERTIFICATE_RENEWAL_FAILED('service-123')
    expect(query.trim()).toMatch(/^count\(/)
    expect(query).toContain('condition="Ready"} == 0')
    expect(query).toContain('condition="Issuing"} == 1')
    // Engine exports a Gauge from conditions[].status, not a StateSet with a status label.
    expect(query).not.toContain('status=')
  })
})
