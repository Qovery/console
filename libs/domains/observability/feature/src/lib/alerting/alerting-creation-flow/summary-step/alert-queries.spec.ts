import {
  QUERY_CPU,
  QUERY_HTTP_ERROR,
  QUERY_HTTP_ERROR_COMBINED,
  QUERY_HTTP_ERROR_ENVOY,
  QUERY_HTTP_LATENCY,
  QUERY_HTTP_LATENCY_COMBINED,
  QUERY_HTTP_LATENCY_ENVOY,
  QUERY_INSTANCE_RESTART,
  QUERY_MEMORY,
  QUERY_MISSING_INSTANCE,
} from './alert-queries'

describe('QUERY_CPU', () => {
  it('should generate CPU query with correct metric and labels', () => {
    const query = QUERY_CPU('app-container')

    expect(query).toContain('container_cpu_usage_seconds_total')
    expect(query).toContain('container="app-container"')
    expect(query).toContain('kube_pod_container_resource_requests')
    expect(query).toContain('resource="cpu"')
    expect(query).toContain('rate(')
    expect(query).toContain('[1m]')
  })

  it('should calculate CPU as ratio of usage to requests', () => {
    const query = QUERY_CPU('app-container')

    expect(query).toContain('/')
    expect(query).toContain('on(pod, namespace, container)')
  })
})

describe('QUERY_MEMORY', () => {
  it('should generate memory query with correct metric and labels', () => {
    const query = QUERY_MEMORY('app-container')

    expect(query).toContain('container_memory_working_set_bytes')
    expect(query).toContain('container="app-container"')
    expect(query).toContain('kube_pod_container_resource_requests')
    expect(query).toContain('resource="memory"')
  })

  it('should calculate memory as ratio of usage to requests', () => {
    const query = QUERY_MEMORY('app-container')

    expect(query).toContain('/')
    expect(query).toContain('on(pod, namespace, container)')
  })
})

describe('QUERY_HTTP_ERROR', () => {
  it('should generate nginx error rate query with correct metric', () => {
    const query = QUERY_HTTP_ERROR('api-ingress')

    expect(query).toContain('nginx_ingress_controller_requests')
    expect(query).toContain('ingress="api-ingress"')
    expect(query).toContain('status=~"5.."')
    expect(query).toContain('rate(')
    expect(query).toContain('[1m]')
  })

  it('should aggregate by ingress and namespace', () => {
    const query = QUERY_HTTP_ERROR('api-ingress')

    expect(query).toContain('sum by (ingress, namespace)')
  })

  it('should calculate error rate as ratio (errors / total)', () => {
    const query = QUERY_HTTP_ERROR('api-ingress')

    expect(query).toContain('/')
    const parts = query.split('/')
    expect(parts.length).toBeGreaterThan(1)
  })
})

describe('QUERY_HTTP_ERROR_ENVOY', () => {
  it('should generate envoy error rate query with correct metric', () => {
    const query = QUERY_HTTP_ERROR_ENVOY('api-route')

    expect(query).toContain('envoy_cluster_upstream_rq_xx')
    expect(query).toContain('httproute_name="api-route"')
    expect(query).toContain('envoy_response_code_class="5"')
    expect(query).toContain('rate(')
    expect(query).toContain('[1m]')
  })

  it('should aggregate by httproute_name and namespace', () => {
    const query = QUERY_HTTP_ERROR_ENVOY('api-route')

    expect(query).toContain('sum by (httproute_name, namespace)')
  })

  it('should calculate error rate as ratio', () => {
    const query = QUERY_HTTP_ERROR_ENVOY('api-route')

    expect(query).toContain('/')
  })
})

describe('QUERY_HTTP_ERROR_COMBINED', () => {
  const testIngressName = 'api-ingress'
  const testRouteName = 'api-route'

  it('should use max() to take worst case between sources', () => {
    const query = QUERY_HTTP_ERROR_COMBINED(testIngressName, testRouteName)

    expect(query).toMatch(/^max\(/)
  })

  it('should include both nginx and envoy metrics', () => {
    const query = QUERY_HTTP_ERROR_COMBINED(testIngressName, testRouteName)

    expect(query).toContain('nginx_ingress_controller_requests')
    expect(query).toContain('envoy_cluster_upstream_rq_xx')
    expect(query).toContain(`ingress="${testIngressName}"`)
    expect(query).toContain(`httproute_name="${testRouteName}"`)
  })

  it('should use or vector(0) for both sources', () => {
    const query = QUERY_HTTP_ERROR_COMBINED(testIngressName, testRouteName)

    const matches = query.match(/or vector\(0\)/g)
    expect(matches).toHaveLength(2)
  })

  it('should handle nginx-only case with empty envoy identifier', () => {
    const query = QUERY_HTTP_ERROR_COMBINED(testIngressName, '')

    expect(query).toContain(`ingress="${testIngressName}"`)
    expect(query).toContain('httproute_name=""')
    expect(query).toContain('or vector(0)')
  })

  it('should handle envoy-only case with empty nginx identifier', () => {
    const query = QUERY_HTTP_ERROR_COMBINED('', testRouteName)

    expect(query).toContain('ingress=""')
    expect(query).toContain(`httproute_name="${testRouteName}"`)
    expect(query).toContain('or vector(0)')
  })

  it('should aggregate by namespace for both sources', () => {
    const query = QUERY_HTTP_ERROR_COMBINED(testIngressName, testRouteName)

    expect(query).toContain('sum by (namespace)')
  })

  it('should filter 5xx errors for both sources', () => {
    const query = QUERY_HTTP_ERROR_COMBINED(testIngressName, testRouteName)

    expect(query).toContain('status=~"5.."')
    expect(query).toContain('envoy_response_code_class="5"')
  })
})

describe('QUERY_HTTP_LATENCY', () => {
  it('should calculate p99 latency using histogram_quantile', () => {
    const query = QUERY_HTTP_LATENCY('api-ingress')

    expect(query).toContain('histogram_quantile')
    expect(query).toContain('0.99')
  })

  it('should use nginx request duration bucket metric', () => {
    const query = QUERY_HTTP_LATENCY('api-ingress')

    expect(query).toContain('nginx_ingress_controller_request_duration_seconds_bucket')
    expect(query).toContain('ingress="api-ingress"')
  })

  it('should aggregate by namespace, ingress, and le', () => {
    const query = QUERY_HTTP_LATENCY('api-ingress')

    expect(query).toContain('sum by (namespace, ingress, le)')
  })

  it('should use 1m rate window', () => {
    const query = QUERY_HTTP_LATENCY('api-ingress')

    expect(query).toContain('rate(')
    expect(query).toContain('[1m]')
  })
})

describe('QUERY_HTTP_LATENCY_ENVOY', () => {
  it('should calculate p99 latency using histogram_quantile', () => {
    const query = QUERY_HTTP_LATENCY_ENVOY('api-route')

    expect(query).toContain('histogram_quantile')
    expect(query).toContain('0.99')
  })

  it('should use envoy request time bucket metric', () => {
    const query = QUERY_HTTP_LATENCY_ENVOY('api-route')

    expect(query).toContain('envoy_cluster_upstream_rq_time_bucket')
    expect(query).toContain('httproute_name="api-route"')
  })

  it('should convert milliseconds to seconds', () => {
    const query = QUERY_HTTP_LATENCY_ENVOY('api-route')

    expect(query).toContain('/ 1000')
  })

  it('should aggregate by namespace, httproute_name, and le', () => {
    const query = QUERY_HTTP_LATENCY_ENVOY('api-route')

    expect(query).toContain('sum by (namespace, httproute_name, le)')
  })
})

describe('QUERY_HTTP_LATENCY_COMBINED', () => {
  const testIngressName = 'api-ingress'
  const testRouteName = 'api-route'

  it('should use max() to take worst case between sources', () => {
    const query = QUERY_HTTP_LATENCY_COMBINED(testIngressName, testRouteName)

    expect(query).toMatch(/^max\(/)
  })

  it('should include both nginx and envoy latency metrics', () => {
    const query = QUERY_HTTP_LATENCY_COMBINED(testIngressName, testRouteName)

    expect(query).toContain('nginx_ingress_controller_request_duration_seconds_bucket')
    expect(query).toContain('envoy_cluster_upstream_rq_time_bucket')
    expect(query).toContain(`ingress="${testIngressName}"`)
    expect(query).toContain(`httproute_name="${testRouteName}"`)
  })

  it('should calculate p99 for both sources', () => {
    const query = QUERY_HTTP_LATENCY_COMBINED(testIngressName, testRouteName)

    const matches = query.match(/histogram_quantile\s*\(\s*0\.99/g)
    expect(matches).toHaveLength(2)
  })

  it('should use or vector(0) for both sources', () => {
    const query = QUERY_HTTP_LATENCY_COMBINED(testIngressName, testRouteName)

    const matches = query.match(/or vector\(0\)/g)
    expect(matches).toHaveLength(2)
  })

  it('should convert envoy latency from milliseconds to seconds', () => {
    const query = QUERY_HTTP_LATENCY_COMBINED(testIngressName, testRouteName)

    expect(query).toContain('/ 1000')
  })

  it('should handle nginx-only case', () => {
    const query = QUERY_HTTP_LATENCY_COMBINED(testIngressName, '')

    expect(query).toContain(`ingress="${testIngressName}"`)
    expect(query).toContain('httproute_name=""')
  })

  it('should handle envoy-only case', () => {
    const query = QUERY_HTTP_LATENCY_COMBINED('', testRouteName)

    expect(query).toContain('ingress=""')
    expect(query).toContain(`httproute_name="${testRouteName}"`)
  })

  it('should aggregate by namespace and le for histogram', () => {
    const query = QUERY_HTTP_LATENCY_COMBINED(testIngressName, testRouteName)

    expect(query).toContain('sum by (namespace, le)')
  })
})

describe('QUERY_INSTANCE_RESTART', () => {
  it('should track container restarts using increase', () => {
    const query = QUERY_INSTANCE_RESTART('app-container')

    expect(query).toContain('kube_pod_container_status_restarts_total')
    expect(query).toContain('container="app-container"')
    expect(query).toContain('increase(')
  })
})

describe('QUERY_MISSING_INSTANCE', () => {
  it('should check deployment replicas ratio', () => {
    const query = QUERY_MISSING_INSTANCE('app-container')

    expect(query).toContain('kube_deployment_status_replicas_available')
    expect(query).toContain('kube_deployment_spec_replicas')
    expect(query).toContain('deployment="app-container"')
  })
})

describe('HTTP Query Consistency', () => {
  it('should use consistent 1m rate window across all HTTP queries', () => {
    const httpQueries = [
      QUERY_HTTP_ERROR('api-ingress'),
      QUERY_HTTP_ERROR_ENVOY('api-route'),
      QUERY_HTTP_ERROR_COMBINED('api-ingress', 'api-route'),
      QUERY_HTTP_LATENCY('api-ingress'),
      QUERY_HTTP_LATENCY_ENVOY('api-route'),
      QUERY_HTTP_LATENCY_COMBINED('api-ingress', 'api-route'),
    ]

    httpQueries.forEach((query) => {
      expect(query).toContain('[1m]')
    })
  })

  it('should use max() aggregation for all combined queries', () => {
    const combinedQueries = [
      QUERY_HTTP_ERROR_COMBINED('api-ingress', 'api-route'),
      QUERY_HTTP_LATENCY_COMBINED('api-ingress', 'api-route'),
    ]

    combinedQueries.forEach((query) => {
      expect(query).toMatch(/^max\(/)
    })
  })

  it('should include or vector(0) for resilience in combined queries', () => {
    const combinedQueries = [
      QUERY_HTTP_ERROR_COMBINED('api-ingress', 'api-route'),
      QUERY_HTTP_LATENCY_COMBINED('api-ingress', 'api-route'),
    ]

    combinedQueries.forEach((query) => {
      const matches = query.match(/or vector\(0\)/g)
      expect(matches).toHaveLength(2)
    })
  })
})

describe('Special Characters in Identifiers', () => {
  it('should handle ingress names with hyphens and dots', () => {
    const query = QUERY_HTTP_ERROR('my-app-v2.0')

    expect(query).toContain('ingress="my-app-v2.0"')
  })

  it('should handle route names with underscores and hyphens', () => {
    const query = QUERY_HTTP_ERROR_ENVOY('my-route_v1.0-beta')

    expect(query).toContain('httproute_name="my-route_v1.0-beta"')
  })

  it('should handle container names with version numbers', () => {
    const query = QUERY_CPU('app-container-v2.0')

    expect(query).toContain('container="app-container-v2.0"')
  })
})

describe('Query Structure Validation', () => {
  it('should calculate error rates as division (errors / total)', () => {
    const errorQueries = [
      QUERY_HTTP_ERROR('api-ingress'),
      QUERY_HTTP_ERROR_ENVOY('api-route'),
      QUERY_HTTP_ERROR_COMBINED('api-ingress', 'api-route'),
    ]

    errorQueries.forEach((query) => {
      expect(query).toContain('/')
      const parts = query.split('/')
      expect(parts.length).toBeGreaterThan(1)
    })
  })

  it('should use histogram_quantile for all latency queries', () => {
    const latencyQueries = [
      QUERY_HTTP_LATENCY('api-ingress'),
      QUERY_HTTP_LATENCY_ENVOY('api-route'),
      QUERY_HTTP_LATENCY_COMBINED('api-ingress', 'api-route'),
    ]

    latencyQueries.forEach((query) => {
      expect(query).toContain('histogram_quantile')
      expect(query).toContain('0.99')
    })
  })

  it('should calculate resource usage as ratio to requests', () => {
    const resourceQueries = [QUERY_CPU('app-container'), QUERY_MEMORY('app-container')]

    resourceQueries.forEach((query) => {
      expect(query).toContain('/')
      expect(query).toContain('kube_pod_container_resource_requests')
      expect(query).toContain('on(pod, namespace, container)')
    })
  })
})
