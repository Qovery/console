import { QUERY_CPU, QUERY_MEMORY } from './alert-queries'

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
})
