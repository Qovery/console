import type { AlertRuleCreationRequest } from 'qovery-typescript-axios'

export type MetricCategory =
  | 'cpu'
  | 'memory'
  | 'http_error'
  | 'http_latency'
  | 'missing_replicas'
  | 'restart_reason'
  | 'hpa_issue'
export interface AlertConfiguration
  extends Omit<AlertRuleCreationRequest, 'organization_id' | 'cluster_id' | 'target' | 'enabled' | 'description'> {
  id: string
  tag: MetricCategory | string
  skipped?: boolean
}
