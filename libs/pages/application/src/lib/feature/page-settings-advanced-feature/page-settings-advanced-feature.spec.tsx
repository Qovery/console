import { render } from '__tests__/utils/setup-jest'
import PageSettingsAdvancedFeature, { sortAlphabetically } from './page-settings-advanced-feature'

describe('PageSettingsAdvancedFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsAdvancedFeature />)
    expect(baseElement).toBeTruthy()
  })
})

describe('Sort By Domain And Subdomain', () => {
  it('should sort by domain and subdomain', () => {
    const unsortedDomains = [
      'deployment.delay_start_time_sec',
      'deployment.custom_domain_check_enabled',
      'build.timeout_max_sec',
      'network.ingress.proxy_body_size_mb',
      'network.ingress.enable_cors',
      'network.ingress.cors_allow_origin',
      'network.ingress.cors_allow_methods',
      'network.ingress.cors_allow_headers',
      'network.ingress.proxy_buffer_size_kb',
      'readiness_probe.type',
      'readiness_probe.http_get.path',
      'readiness_probe.initial_delay_seconds',
      'readiness_probe.period_seconds',
      'readiness_probe.timeout_seconds',
      'readiness_probe.success_threshold',
      'readiness_probe.failure_threshold',
      'liveness_probe.type',
      'liveness_probe.http_get.path',
      'liveness_probe.initial_delay_seconds',
      'liveness_probe.period_seconds',
      'liveness_probe.timeout_seconds',
      'liveness_probe.success_threshold',
      'liveness_probe.failure_threshold',
      'hpa.cpu.average_utilization_percent',
    ]

    expect(unsortedDomains.sort(sortAlphabetically)).toEqual([
      'build.timeout_max_sec',
      'deployment.custom_domain_check_enabled',
      'deployment.delay_start_time_sec',
      'hpa.cpu.average_utilization_percent',
      'liveness_probe.failure_threshold',
      'liveness_probe.http_get.path',
      'liveness_probe.initial_delay_seconds',
      'liveness_probe.period_seconds',
      'liveness_probe.success_threshold',
      'liveness_probe.timeout_seconds',
      'liveness_probe.type',
      'network.ingress.cors_allow_headers',
      'network.ingress.cors_allow_methods',
      'network.ingress.cors_allow_origin',
      'network.ingress.enable_cors',
      'network.ingress.proxy_body_size_mb',
      'network.ingress.proxy_buffer_size_kb',
      'readiness_probe.failure_threshold',
      'readiness_probe.http_get.path',
      'readiness_probe.initial_delay_seconds',
      'readiness_probe.period_seconds',
      'readiness_probe.success_threshold',
      'readiness_probe.timeout_seconds',
      'readiness_probe.type',
    ])
  })
})
