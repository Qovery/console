import type { AlertSeverity } from 'qovery-typescript-axios'

type MetricCategory = 'cpu' | 'memory' | 'instances' | 'k8s_event' | 'network' | 'logs'
export interface AlertConfiguration {
  id: string
  metricCategory: MetricCategory | string
  metricType: 'avg' | 'max' | 'min' | 'count' | 'throughput' | 'latency' | 'error_rate'
  forDuration: string
  condition: {
    operator: 'above' | 'below'
    threshold: string
  }
  autoResolve: {
    operator: 'above' | 'below'
    threshold: string
  }
  name: string
  severity: AlertSeverity
  notificationChannels: string[]
  skipped?: boolean
}
