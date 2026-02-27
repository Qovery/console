import type { HelmPortRequestPortsInner } from 'qovery-typescript-axios'

/**
 * Possible validation states for a port
 */
export type PortValidationStatusType = 'valid' | 'invalid' | 'unknown' | 'loading'

/**
 * Reasons why validation cannot be performed
 */
export type ValidationReason =
  | 'SERVICE_NOT_DEPLOYED' // Helm service has never been deployed
  | 'SERVICE_STOPPED' // Helm service is stopped
  | 'API_ERROR' // Failed to fetch K8s services
  | 'API_TIMEOUT' // K8s services request timed out

/**
 * Validation result for a single configured port
 */
export interface PortValidationResult {
  /** The port name (unique identifier within Helm config) */
  portName: string

  /** Validation status */
  status: PortValidationStatusType

  /** Human-readable error message when status is 'invalid' */
  errorMessage?: string

  /** Original port configuration for reference */
  port: HelmPortRequestPortsInner
}

/**
 * Overall validation context for a Helm service
 * Returned by the usePortValidation hook
 */
export interface PortValidationContext {
  /** Whether validation can be performed */
  canValidate: boolean

  /** Reason why validation cannot be performed (when canValidate is false) */
  validationReason: ValidationReason | null

  /** Whether validation data is currently loading */
  isLoading: boolean

  /** Validation results for all configured ports */
  results: PortValidationResult[]

  /** Retry function for API errors */
  retry: () => void
}

/**
 * Props for the usePortValidation hook
 */
export interface UsePortValidationProps {
  /** Helm service ID */
  helmId: string

  /** Environment ID (for deployment status lookup) */
  environmentId: string

  /** Configured ports to validate */
  ports: HelmPortRequestPortsInner[]
}

/**
 * Kubernetes service structure from API
 */
export interface KubernetesService {
  metadata: {
    name: string
    namespace: string
  }
  service_spec: {
    ports?: Array<{
      port: number
      name?: string
      protocol?: string
    }>
  }
}
