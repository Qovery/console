import type { AlertRuleCreationRequest } from 'qovery-typescript-axios'

export type MetricCategory =
  | 'cpu'
  | 'memory'
  | 'http_error'
  | 'http_latency'
  | 'missing_instance'
  | 'instance_restart'
  | 'hpa_limit'

export interface AlertConfiguration
  extends Omit<AlertRuleCreationRequest, 'organization_id' | 'cluster_id' | 'target' | 'enabled' | 'description'> {
  id: string
  tag: MetricCategory | string
  skipped?: boolean
}
