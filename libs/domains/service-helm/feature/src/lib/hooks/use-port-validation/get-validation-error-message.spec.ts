import type { HelmPortRequestPortsInner } from 'qovery-typescript-axios'
import { getValidationErrorMessage } from './get-validation-error-message'

describe('getValidationErrorMessage', () => {
  const createPort = (overrides: Partial<HelmPortRequestPortsInner> = {}): HelmPortRequestPortsInner => ({
    name: 'test-port',
    service_name: 'nginx',
    internal_port: 80,
    external_port: 443,
    protocol: 'HTTP',
    ...overrides,
  })

  describe('when reason is service_not_found', () => {
    it('should return message without namespace when namespace is not specified', () => {
      const port = createPort({ service_name: 'my-service', namespace: undefined })

      const result = getValidationErrorMessage(port, 'service_not_found')

      expect(result).toBe("Service 'my-service' not found")
    })

    it('should return message without namespace when namespace is empty string', () => {
      const port = createPort({ service_name: 'my-service', namespace: '' })

      const result = getValidationErrorMessage(port, 'service_not_found')

      expect(result).toBe("Service 'my-service' not found")
    })

    it('should include namespace in message when namespace is specified', () => {
      const port = createPort({ service_name: 'my-service', namespace: 'production' })

      const result = getValidationErrorMessage(port, 'service_not_found')

      expect(result).toBe("Service 'my-service' not found in namespace 'production'")
    })
  })

  describe('when reason is port_not_found', () => {
    it('should return message with service name and port number', () => {
      const port = createPort({ service_name: 'api', internal_port: 3000 })

      const result = getValidationErrorMessage(port, 'port_not_found')

      expect(result).toBe("Service 'api' does not expose port 3000")
    })

    it('should not include namespace in port_not_found message', () => {
      const port = createPort({ service_name: 'api', internal_port: 8080, namespace: 'default' })

      const result = getValidationErrorMessage(port, 'port_not_found')

      expect(result).toBe("Service 'api' does not expose port 8080")
    })
  })

  describe('edge cases', () => {
    it('should handle special characters in service name', () => {
      const port = createPort({ service_name: 'my-service-v2.0', internal_port: 80 })

      const result = getValidationErrorMessage(port, 'service_not_found')

      expect(result).toBe("Service 'my-service-v2.0' not found")
    })

    it('should handle port 0', () => {
      const port = createPort({ service_name: 'nginx', internal_port: 0 })

      const result = getValidationErrorMessage(port, 'port_not_found')

      expect(result).toBe("Service 'nginx' does not expose port 0")
    })

    it('should handle high port numbers', () => {
      const port = createPort({ service_name: 'nginx', internal_port: 65535 })

      const result = getValidationErrorMessage(port, 'port_not_found')

      expect(result).toBe("Service 'nginx' does not expose port 65535")
    })
  })
})
