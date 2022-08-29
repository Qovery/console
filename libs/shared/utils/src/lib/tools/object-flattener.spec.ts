import { objectFlattener } from './object-flattener'

const unflattened = {
  build: { timeout_max_sec: '1800' },
  deployment: { custom_domain_check_enabled: 'false', delay_start_time_sec: '403' },
  hpa: { cpu: { average_utilization_percent: '33' } },
  liveness_probe: {
    failure_threshold: '3',
    http_get: { path: '/remi' },
    initial_delay_seconds: '30',
    period_seconds: '10',
    success_threshold: '1',
    timeout_seconds: '5',
    type: 'TCP',
  },
  network: {
    ingress: {
      cors_allow_headers:
        'DNT,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization',
      cors_allow_methods: 'GET, PUT, POST, DELETE, PATCH, OPTIONS',
      cors_allow_origin: '*',
      enable_cors: 'true',
      proxy_body_size_mb: '1000',
      proxy_buffer_size_kb: '4',
    },
  },
  readiness_probe: {
    failure_threshold: '9',
    http_get: { path: '/' },
    initial_delay_seconds: '300',
    period_seconds: '10',
    success_threshold: '12',
    timeout_seconds: '1',
    type: 'TCP',
  },
}

const flattened = {
  'build.timeout_max_sec': 1800,
  'deployment.custom_domain_check_enabled': false,
  'deployment.delay_start_time_sec': 403,
  'hpa.cpu.average_utilization_percent': 33,
  'liveness_probe.failure_threshold': 3,
  'liveness_probe.http_get.path': '/remi',
  'liveness_probe.initial_delay_seconds': 30,
  'liveness_probe.period_seconds': 10,
  'liveness_probe.success_threshold': 1,
  'liveness_probe.timeout_seconds': 5,
  'liveness_probe.type': 'TCP',
  'network.ingress.cors_allow_headers':
    'DNT,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization',
  'network.ingress.cors_allow_methods': 'GET, PUT, POST, DELETE, PATCH, OPTIONS',
  'network.ingress.cors_allow_origin': '*',
  'network.ingress.enable_cors': true,
  'network.ingress.proxy_body_size_mb': 1000,
  'network.ingress.proxy_buffer_size_kb': 4,
  'readiness_probe.failure_threshold': 9,
  'readiness_probe.http_get.path': '/',
  'readiness_probe.initial_delay_seconds': 300,
  'readiness_probe.period_seconds': 10,
  'readiness_probe.success_threshold': 12,
  'readiness_probe.timeout_seconds': 1,
  'readiness_probe.type': 'TCP',
}

describe('ObjectFlattener', () => {
  it('should flatten an object', () => {
    expect(objectFlattener(unflattened)).toEqual(flattened)
  })
})
