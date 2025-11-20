import type { AlertRuleCreationRequest } from 'qovery-typescript-axios'

type MetricCategory = 'cpu' | 'memory' | 'instances' | 'k8s_event' | 'network' | 'logs'
export interface AlertConfiguration
  extends Omit<
    AlertRuleCreationRequest,
    'organization_id' | 'cluster_id' | 'target' | 'enabled' | 'description' | 'presentation'
  > {
  id: string
  tag: MetricCategory | string
  skipped?: boolean
}
