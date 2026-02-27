import { ServiceDeploymentStatusEnum } from 'qovery-typescript-axios'
import type { ValidationReason } from './types'

/**
 * Determines the reason why validation cannot be performed.
 *
 * @param deploymentStatus - Service deployment status enum
 * @param runningState - Service running state string (e.g., 'RUNNING', 'STOPPED')
 * @param kubernetesServices - K8s services from API (undefined if error)
 * @param isError - Whether the K8s services query errored
 * @returns ValidationReason or null if validation can proceed
 */
export function getValidationReason(
  deploymentStatus: ServiceDeploymentStatusEnum | undefined,
  runningState: string | undefined,
  kubernetesServices: unknown[] | undefined,
  isError: boolean
): ValidationReason | null {
  // Check if service has never been deployed
  if (deploymentStatus === ServiceDeploymentStatusEnum.NEVER_DEPLOYED) {
    return 'SERVICE_NOT_DEPLOYED'
  }

  // Check if service is stopped
  if (runningState === 'STOPPED') {
    return 'SERVICE_STOPPED'
  }

  // Check for API errors
  if (isError) {
    return 'API_ERROR'
  }

  // Check if K8s services returned empty (service might be stopped or errored)
  if (kubernetesServices !== undefined && kubernetesServices.length === 0 && runningState !== 'RUNNING') {
    return 'SERVICE_STOPPED'
  }

  return null
}
