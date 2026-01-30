import type { HelmPortRequestPortsInner } from 'qovery-typescript-axios'

/**
 * Generates a human-readable error message for a validation failure.
 *
 * @param port - The port that failed validation
 * @param reason - Why validation failed ('service_not_found' | 'port_not_found')
 * @returns Human-readable error string
 */
export function getValidationErrorMessage(
  port: HelmPortRequestPortsInner,
  reason: 'service_not_found' | 'port_not_found'
): string {
  if (reason === 'service_not_found') {
    return port.namespace
      ? `Service '${port.service_name}' not found in namespace '${port.namespace}'`
      : `Service '${port.service_name}' not found`
  }

  return `Service '${port.service_name}' does not expose port ${port.internal_port}`
}
