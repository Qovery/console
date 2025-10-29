export interface AlertConfiguration {
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
  severity: string
  notificationChannels: string[]
  skipped?: boolean
}

export interface BulkCreationFlowProps {
  selectedMetrics: string[]
  serviceId: string
  serviceName: string
  onClose: () => void
  onComplete: (alerts: AlertConfiguration[]) => void
}
