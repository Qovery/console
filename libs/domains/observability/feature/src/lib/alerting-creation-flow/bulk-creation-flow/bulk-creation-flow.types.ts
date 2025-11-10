import type { AlertSeverity } from 'qovery-typescript-axios'

export interface AlertConfiguration {
  id: string
  metricCategory: string
  metricType: 'avg' | 'max' | 'min' | 'count' | 'throughput' | 'latency' | 'error_rate'
  condition: {
    operator: 'above' | 'below'
    threshold: string
    duration: string
  }
  autoResolve: {
    operator: 'above' | 'below'
    threshold: string
    duration: string
  }
  name: string
  severity: AlertSeverity
  notificationChannels: string[]
  skipped?: boolean
}
