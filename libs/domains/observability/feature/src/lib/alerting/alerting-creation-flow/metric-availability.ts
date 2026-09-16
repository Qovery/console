import { type AnyService } from '@qovery/domains/services/data-access'
import { type MetricCategory } from './alerting-creation-flow.types'

export const CONTAINER_METRICS: string[] = ['cpu', 'memory', 'missing_instance', 'instance_restart']
export const HTTP_METRICS: string[] = ['http_error', 'http_latency']

const METRIC_CATEGORIES: MetricCategory[] = [
  'cpu',
  'memory',
  'http_error',
  'http_latency',
  'missing_instance',
  'instance_restart',
  'hpa_limit',
  'certificate_renewal_failed',
]

export function canCreateCertificateRenewalAlert(
  enabled: boolean | undefined,
  service?: Pick<AnyService, 'serviceType'>
) {
  return enabled === true && (!service || ['APPLICATION', 'CONTAINER', 'HELM'].includes(service.serviceType))
}

export function getSelectedAlertMetrics(
  metric: string,
  templates: string | undefined,
  certificateEnabled: boolean
): MetricCategory[] {
  const fromTemplates = (templates ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter((item): item is MetricCategory => METRIC_CATEGORIES.includes(item as MetricCategory))
  const selected =
    fromTemplates.length > 0
      ? fromTemplates
      : METRIC_CATEGORIES.includes(metric as MetricCategory)
        ? [metric as MetricCategory]
        : ['cpu' as MetricCategory]
  return [...new Set(selected)].filter((item) => item !== 'certificate_renewal_failed' || certificateEnabled)
}
