import { type AlertConfiguration } from './bulk-creation-flow/bulk-creation-flow.types'

export type MetricIndex = 'new' | 'cpu' | 'memory' | 'instances' | 'k8s_event' | 'network' | 'logs'

type MetricTemplate = Omit<AlertConfiguration, 'metricCategory' | 'name' | 'notificationChannels'>

interface MetricTemplateConfig {
  name: string
  description: string
  template: MetricTemplate
}

export const METRIC_TEMPLATE: Record<string, MetricTemplateConfig> = {
  cpu: {
    name: 'CPU',
    description: 'Monitor CPU usage of your service',
    template: {
      metricType: 'avg',
      condition: {
        operator: 'above',
        threshold: '80',
        duration: '5m',
      },
      autoResolve: {
        operator: 'below',
        threshold: '80',
        duration: '5m',
      },
      severity: 'critical',
    },
  },
  logs: {
    name: 'Logs',
    description: 'Monitor logs of your service',
    template: {
      metricType: 'count',
      condition: {
        operator: 'above',
        threshold: '100',
        duration: '5m',
      },
      autoResolve: {
        operator: 'below',
        threshold: '100',
        duration: '5m',
      },
      severity: 'critical',
    },
  },
}
