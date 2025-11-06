import type { AlertSeverity } from 'qovery-typescript-axios'

export interface AlertConfiguration {
  id: string
  metricCategory: string
  metricType: string
  condition: {
    operator: string
    threshold: string
    duration: string
  }
  autoResolve: {
    operator: string
    threshold: string
    duration: string
  }
  name: string
  severity: AlertSeverity
  notificationChannels: string[]
  skipped?: boolean
}
