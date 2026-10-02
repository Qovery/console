import type { AlertRuleCreationRequest } from 'qovery-typescript-axios'
import { type RdsMetricCategory } from './rds-alert-metrics'

export type MetricCategory =
  | RdsMetricCategory
  | 'cpu'
  | 'memory'
  | 'http_error'
  | 'http_latency'
  | 'missing_instance'
  | 'instance_restart'
  | 'hpa_limit'
  | 'certificate_renewal_failed'

export interface AlertConfiguration
  extends Omit<AlertRuleCreationRequest, 'organization_id' | 'cluster_id' | 'target' | 'enabled' | 'description'> {
  id: string
  tag: MetricCategory | string
  skipped?: boolean
}
