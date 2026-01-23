import { type LogFilters, buildLokiQuery } from './domains-service-logs-data-access'

describe('buildLokiQuery', () => {
  const baseFilters: LogFilters = {
    serviceId: 'test-service-id',
  }

  describe('service logs (default)', () => {
    it('should build query for service logs with only serviceId', () => {
      const query = buildLokiQuery(baseFilters)
      expect(query).toBe('{qovery_com_service_id="test-service-id"}')
    })

    it('should build query for service logs with explicit logType', () => {
      const query = buildLokiQuery(baseFilters, 'service')
      expect(query).toBe('{qovery_com_service_id="test-service-id"}')
    })

    it('should build query with level filter', () => {
      const query = buildLokiQuery({ ...baseFilters, level: 'error' })
      expect(query).toBe('{qovery_com_service_id="test-service-id",level="error"}')
    })

    it('should build query with instance filter', () => {
      const query = buildLokiQuery({ ...baseFilters, instance: 'pod-123' })
      expect(query).toBe('{qovery_com_service_id="test-service-id",pod="pod-123"}')
    })

    it('should build query with container filter', () => {
      const query = buildLokiQuery({ ...baseFilters, container: 'main' })
      expect(query).toBe('{qovery_com_service_id="test-service-id",container="main"}')
    })

    it('should build query with namespace filter', () => {
      const query = buildLokiQuery({ ...baseFilters, namespace: 'production' })
      expect(query).toBe('{qovery_com_service_id="test-service-id",namespace="production"}')
    })

    it('should build query with version filter', () => {
      const query = buildLokiQuery({ ...baseFilters, version: 'v1.0.0' })
      expect(query).toBe('{qovery_com_service_id="test-service-id",app="v1.0.0"}')
    })

    it('should build query with deploymentId filter', () => {
      const query = buildLokiQuery({ ...baseFilters, deploymentId: 'deploy-123' })
      expect(query).toBe('{qovery_com_service_id="test-service-id",qovery_com_deployment_id="deploy-123"}')
    })

    it('should build query with message search', () => {
      const query = buildLokiQuery({ ...baseFilters, message: 'error occurred' })
      expect(query).toBe('{qovery_com_service_id="test-service-id"} |= "error occurred"')
    })

    it('should build query with search text', () => {
      const query = buildLokiQuery({ ...baseFilters, search: 'exception' })
      expect(query).toBe('{qovery_com_service_id="test-service-id"} |= "exception"')
    })

    it('should build query with multiple filters', () => {
      const query = buildLokiQuery({
        ...baseFilters,
        level: 'error',
        instance: 'pod-123',
        container: 'main',
        message: 'failed',
      })
      expect(query).toBe(
        '{qovery_com_service_id="test-service-id",level="error",pod="pod-123",container="main"} |= "failed"'
      )
    })

    it('should combine message and search filters', () => {
      const query = buildLokiQuery({
        ...baseFilters,
        message: 'error',
        search: 'timeout',
      })
      expect(query).toBe('{qovery_com_service_id="test-service-id"} |= "errortimeout"')
    })
  })

  describe('nginx logs', () => {
    it('should build query for nginx logs', () => {
      const query = buildLokiQuery(baseFilters, 'nginx')
      expect(query).toBe(
        '({app="ingress-nginx"} | level=~"error|warn" or (qovery_com_associated_service_id="test-service-id" and level!~"error|warn"))'
      )
    })

    it('should build nginx query with level filter', () => {
      const query = buildLokiQuery({ ...baseFilters, level: 'error' }, 'nginx')
      expect(query).toBe(
        '({app="ingress-nginx"} | level=~"error|warn" or (qovery_com_associated_service_id="test-service-id" and level!~"error|warn"),level="error")'
      )
    })

    it('should build nginx query with instance filter', () => {
      const query = buildLokiQuery({ ...baseFilters, instance: 'nginx-pod-123' }, 'nginx')
      expect(query).toBe(
        '({app="ingress-nginx"} | level=~"error|warn" or (qovery_com_associated_service_id="test-service-id" and level!~"error|warn"),pod="nginx-pod-123")'
      )
    })

    it('should build nginx query with message search', () => {
      const query = buildLokiQuery({ ...baseFilters, message: '404' }, 'nginx')
      expect(query).toBe(
        '({app="ingress-nginx"} | level=~"error|warn" or (qovery_com_associated_service_id="test-service-id" and level!~"error|warn")) |= "404"'
      )
    })

    it('should build nginx query with multiple filters', () => {
      const query = buildLokiQuery(
        {
          ...baseFilters,
          level: 'error',
          instance: 'nginx-pod-123',
          message: '500',
        },
        'nginx'
      )
      expect(query).toBe(
        '({app="ingress-nginx"} | level=~"error|warn" or (qovery_com_associated_service_id="test-service-id" and level!~"error|warn"),level="error",pod="nginx-pod-123") |= "500"'
      )
    })
  })

  describe('envoy logs', () => {
    it('should build query for envoy logs', () => {
      const query = buildLokiQuery(baseFilters, 'envoy')
      expect(query).toBe(
        '({app="envoy"} | level=~"error|warn" or (qovery_com_associated_service_id="test-service-id" and level!~"error|warn"))'
      )
    })

    it('should build envoy query with level filter', () => {
      const query = buildLokiQuery({ ...baseFilters, level: 'error' }, 'envoy')
      expect(query).toBe(
        '({app="envoy"} | level=~"error|warn" or (qovery_com_associated_service_id="test-service-id" and level!~"error|warn"),level="error")'
      )
    })

    it('should build envoy query with instance filter', () => {
      const query = buildLokiQuery({ ...baseFilters, instance: 'envoy-pod-123' }, 'envoy')
      expect(query).toBe(
        '({app="envoy"} | level=~"error|warn" or (qovery_com_associated_service_id="test-service-id" and level!~"error|warn"),pod="envoy-pod-123")'
      )
    })

    it('should build envoy query with message search', () => {
      const query = buildLokiQuery({ ...baseFilters, message: 'upstream error' }, 'envoy')
      expect(query).toBe(
        '({app="envoy"} | level=~"error|warn" or (qovery_com_associated_service_id="test-service-id" and level!~"error|warn")) |= "upstream error"'
      )
    })

    it('should build envoy query with multiple filters', () => {
      const query = buildLokiQuery(
        {
          ...baseFilters,
          level: 'warn',
          instance: 'envoy-pod-456',
          container: 'gateway',
          message: 'timeout',
        },
        'envoy'
      )
      expect(query).toBe(
        '({app="envoy"} | level=~"error|warn" or (qovery_com_associated_service_id="test-service-id" and level!~"error|warn"),level="warn",pod="envoy-pod-456",container="gateway") |= "timeout"'
      )
    })

    it('should build envoy query with deploymentId', () => {
      const query = buildLokiQuery({ ...baseFilters, deploymentId: 'deploy-envoy-123' }, 'envoy')
      expect(query).toBe(
        '({app="envoy"} | level=~"error|warn" or (qovery_com_associated_service_id="test-service-id" and level!~"error|warn"),qovery_com_deployment_id="deploy-envoy-123")'
      )
    })
  })

  describe('log type comparison', () => {
    it('should use parentheses for nginx and envoy, curly braces for service', () => {
      const serviceQuery = buildLokiQuery(baseFilters, 'service')
      const nginxQuery = buildLokiQuery(baseFilters, 'nginx')
      const envoyQuery = buildLokiQuery(baseFilters, 'envoy')

      expect(serviceQuery).toMatch(/^\{.*\}$/)
      expect(nginxQuery).toMatch(/^\(.*\)$/)
      expect(envoyQuery).toMatch(/^\(.*\)$/)
    })

    it('should use different app labels for nginx and envoy', () => {
      const nginxQuery = buildLokiQuery(baseFilters, 'nginx')
      const envoyQuery = buildLokiQuery(baseFilters, 'envoy')

      expect(nginxQuery).toContain('app="ingress-nginx"')
      expect(envoyQuery).toContain('app="envoy"')
      expect(nginxQuery).not.toContain('app="envoy"')
      expect(envoyQuery).not.toContain('app="ingress-nginx"')
    })

    it('should use qovery_com_associated_service_id for nginx and envoy', () => {
      const serviceQuery = buildLokiQuery(baseFilters, 'service')
      const nginxQuery = buildLokiQuery(baseFilters, 'nginx')
      const envoyQuery = buildLokiQuery(baseFilters, 'envoy')

      expect(serviceQuery).toContain('qovery_com_service_id="test-service-id"')
      expect(serviceQuery).not.toContain('qovery_com_associated_service_id')

      expect(nginxQuery).toContain('qovery_com_associated_service_id="test-service-id"')
      expect(nginxQuery).not.toContain('qovery_com_service_id="test-service-id"')

      expect(envoyQuery).toContain('qovery_com_associated_service_id="test-service-id"')
      expect(envoyQuery).not.toContain('qovery_com_service_id="test-service-id"')
    })
  })
})
