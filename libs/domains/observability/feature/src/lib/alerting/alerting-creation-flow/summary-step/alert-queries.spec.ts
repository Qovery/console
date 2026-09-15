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

    expect(query).toContain('kube_certmanager_certificate_labels{qovery_com_associated_service_id="service-123"}')
    expect(query).toContain('kube_certmanager_certificate_dns_names{qovery_com_associated_service_id="service-123"}')
    expect(query).toContain('certmanager_certificate_renewal_timestamp_seconds')
    expect(query).toContain('certmanager_certificate_ready_status')
    expect(query).toContain('certmanager_certificate_challenge_status')
    expect(query).toContain('and on (namespace, domain) group_left')
  })
})
