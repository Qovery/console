import { useCallback, useMemo } from 'react'
import { useDeploymentStatus, useRunningStatus } from '@qovery/domains/services/feature'
import { useKubernetesServices } from '../use-kubernetes-services/use-kubernetes-services'
import { getValidationReason } from './get-validation-reason'
import type { KubernetesService, PortValidationContext, PortValidationResult, UsePortValidationProps } from './types'
import { validatePort } from './validate-port'

/**
 * Hook for validating Helm port configurations against deployed Kubernetes services.
 *
 * Combines deployment status, running status, and K8s services to determine
 * whether validation can be performed and validates each configured port.
 */
export function usePortValidation({ helmId, environmentId, ports }: UsePortValidationProps): PortValidationContext {
  const deploymentStatusQuery = useDeploymentStatus({
    environmentId,
    serviceId: helmId,
  })

  const runningStatusQuery = useRunningStatus({
    environmentId,
    serviceId: helmId,
  })

  const kubernetesServicesQuery = useKubernetesServices({ helmId })

  const isLoading = deploymentStatusQuery.isLoading || runningStatusQuery.isLoading || kubernetesServicesQuery.isLoading

  const retry = useCallback(() => {
    kubernetesServicesQuery.refetch()
  }, [kubernetesServicesQuery])

  const validationContext = useMemo((): PortValidationContext => {
    const deploymentStatus = deploymentStatusQuery.data?.service_deployment_status
    const runningState = runningStatusQuery.data?.state
    const kubernetesServices = kubernetesServicesQuery.data as KubernetesService[] | undefined
    const isError = kubernetesServicesQuery.isError

    // Determine if validation is possible
    const validationReason = getValidationReason(deploymentStatus, runningState, kubernetesServices, isError)

    const canValidate = validationReason === null && kubernetesServices !== undefined

    // Generate validation results for each port
    const results: PortValidationResult[] = ports.map((port) => {
      const portName = port.name ?? `p${port.internal_port}-${port.service_name}`

      // If still loading, return loading status
      if (isLoading) {
        return {
          portName,
          status: 'loading',
          port,
        }
      }

      // If validation cannot proceed, return unknown status
      if (!canValidate || !kubernetesServices) {
        return {
          portName,
          status: 'unknown',
          port,
        }
      }

      // Perform actual validation
      return validatePort(port, kubernetesServices)
    })

    return {
      canValidate,
      validationReason,
      isLoading,
      results,
      retry,
    }
  }, [
    deploymentStatusQuery.data?.service_deployment_status,
    runningStatusQuery.data?.state,
    kubernetesServicesQuery.data,
    kubernetesServicesQuery.isError,
    ports,
    isLoading,
    retry,
  ])

  return validationContext
}

export default usePortValidation
