import type { AlertRuleCreationRequest } from 'qovery-typescript-axios'

export type MetricCategory = 'cpu' | 'memory' | 'http_error' | 'replicas_number' | 'k8s_event' | 'hpa_issue'
export interface AlertConfiguration
  extends Omit<
    AlertRuleCreationRequest,
    'organization_id' | 'cluster_id' | 'target' | 'enabled' | 'description' | 'presentation'
  > {
  id: string
  tag: MetricCategory | string
  skipped?: boolean
}
