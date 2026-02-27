import type { HelmPortRequestPortsInner } from 'qovery-typescript-axios'
import type { KubernetesService } from './types'
import { validatePort } from './validate-port'

describe('validatePort', () => {
  const createPort = (overrides: Partial<HelmPortRequestPortsInner> = {}): HelmPortRequestPortsInner => ({
    name: 'test-port',
    service_name: 'nginx',
    internal_port: 80,
    external_port: 443,
    protocol: 'HTTP',
    ...overrides,
  })

  const createK8sService = (
    name: string,
    namespace: string,
    ports: Array<{ port: number; name?: string }>
  ): KubernetesService => ({
    metadata: { name, namespace },
    service_spec: { ports },
  })

  describe('when service exists and port is valid', () => {
    it('should return valid status when service and port match', () => {
      const port = createPort({ service_name: 'nginx', internal_port: 80 })
      const k8sServices = [createK8sService('nginx', 'default', [{ port: 80 }, { port: 443 }])]

      const result = validatePort(port, k8sServices)

      expect(result).toEqual({
        portName: 'test-port',
        status: 'valid',
        port,
      })
    })

    it('should match service by name only when namespace is not specified', () => {
      const port = createPort({ service_name: 'nginx', internal_port: 8080, namespace: undefined })
      const k8sServices = [createK8sService('nginx', 'some-namespace', [{ port: 8080 }])]

      const result = validatePort(port, k8sServices)

      expect(result.status).toBe('valid')
    })

    it('should match service by name and namespace when both are specified', () => {
      const port = createPort({ service_name: 'nginx', internal_port: 80, namespace: 'production' })
      const k8sServices = [
        createK8sService('nginx', 'default', [{ port: 80 }]),
        createK8sService('nginx', 'production', [{ port: 80 }]),
      ]

      const result = validatePort(port, k8sServices)

      expect(result.status).toBe('valid')
    })
  })

  describe('when service is not found', () => {
    it('should return invalid status with error message', () => {
      const port = createPort({ service_name: 'missing-service', internal_port: 80 })
      const k8sServices = [createK8sService('nginx', 'default', [{ port: 80 }])]

      const result = validatePort(port, k8sServices)

      expect(result).toEqual({
        portName: 'test-port',
        status: 'invalid',
        errorMessage: "Service 'missing-service' not found",
        port,
      })
    })

    it('should include namespace in error message when specified', () => {
      const port = createPort({ service_name: 'nginx', internal_port: 80, namespace: 'wrong-namespace' })
      const k8sServices = [createK8sService('nginx', 'default', [{ port: 80 }])]

      const result = validatePort(port, k8sServices)

      expect(result).toEqual({
        portName: 'test-port',
        status: 'invalid',
        errorMessage: "Service 'nginx' not found in namespace 'wrong-namespace'",
        port,
      })
    })

    it('should return invalid when no k8s services exist', () => {
      const port = createPort({ service_name: 'nginx', internal_port: 80 })
      const k8sServices: KubernetesService[] = []

      const result = validatePort(port, k8sServices)

      expect(result.status).toBe('invalid')
      expect(result.errorMessage).toBe("Service 'nginx' not found")
    })
  })

  describe('when port is not found on service', () => {
    it('should return invalid status with error message', () => {
      const port = createPort({ service_name: 'nginx', internal_port: 9999 })
      const k8sServices = [createK8sService('nginx', 'default', [{ port: 80 }, { port: 443 }])]

      const result = validatePort(port, k8sServices)

      expect(result).toEqual({
        portName: 'test-port',
        status: 'invalid',
        errorMessage: "Service 'nginx' does not expose port 9999",
        port,
      })
    })

    it('should return invalid when service has no ports defined', () => {
      const port = createPort({ service_name: 'nginx', internal_port: 80 })
      const k8sServices: KubernetesService[] = [
        {
          metadata: { name: 'nginx', namespace: 'default' },
          service_spec: { ports: undefined },
        },
      ]

      const result = validatePort(port, k8sServices)

      expect(result.status).toBe('invalid')
      expect(result.errorMessage).toBe("Service 'nginx' does not expose port 80")
    })

    it('should return invalid when service has empty ports array', () => {
      const port = createPort({ service_name: 'nginx', internal_port: 80 })
      const k8sServices = [createK8sService('nginx', 'default', [])]

      const result = validatePort(port, k8sServices)

      expect(result.status).toBe('invalid')
      expect(result.errorMessage).toBe("Service 'nginx' does not expose port 80")
    })
  })

  describe('edge cases', () => {
    it('should validate multiple services and find the correct one', () => {
      const port = createPort({ service_name: 'api', internal_port: 3000 })
      const k8sServices = [
        createK8sService('frontend', 'default', [{ port: 80 }]),
        createK8sService('api', 'default', [{ port: 3000 }]),
        createK8sService('database', 'default', [{ port: 5432 }]),
      ]

      const result = validatePort(port, k8sServices)

      expect(result.status).toBe('valid')
    })

    it('should preserve the original port object in the result', () => {
      const port = createPort()
      const k8sServices = [createK8sService('nginx', 'default', [{ port: 80 }])]

      const result = validatePort(port, k8sServices)

      expect(result.port).toBe(port)
    })
  })
})
