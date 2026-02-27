import type { HelmPortRequestPortsInner } from 'qovery-typescript-axios'
import { getValidationErrorMessage } from './get-validation-error-message'
import type { KubernetesService, PortValidationResult } from './types'

/**
 * Validates a single port against the list of available Kubernetes services.
 *
 * Validation rules:
 * 1. Service name must match a deployed K8s service
 * 2. Internal port must be exposed by that service
 * 3. If namespace is specified, it must match the service's namespace
 *
 * @param port - The configured port to validate
 * @param kubernetesServices - Available K8s services from the API
 * @returns PortValidationResult with status and optional error message
 */
export function validatePort(
  port: HelmPortRequestPortsInner,
  kubernetesServices: KubernetesService[]
): PortValidationResult {
  // Find matching service by name (and namespace if specified)
  const matchingService = kubernetesServices.find(
    (service) =>
      service.metadata.name === port.service_name && (!port.namespace || service.metadata.namespace === port.namespace)
  )

  const portName = port.name ?? `p${port.internal_port}-${port.service_name}`

  if (!matchingService) {
    return {
      portName,
      status: 'invalid',
      errorMessage: getValidationErrorMessage(port, 'service_not_found'),
      port,
    }
  }

  // Check if service has the specified port
  const hasPort = matchingService.service_spec.ports?.some((p) => p.port === port.internal_port)

  if (!hasPort) {
    return {
      portName,
      status: 'invalid',
      errorMessage: getValidationErrorMessage(port, 'port_not_found'),
      port,
    }
  }

  return {
    portName,
    status: 'valid',
    port,
  }
}
