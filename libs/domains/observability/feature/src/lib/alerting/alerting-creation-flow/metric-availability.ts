import {
  type AnyService,
  isManagedDatabase,
  isServiceMYSQL,
  isServicePostgreSQL,
} from '@qovery/domains/services/data-access'
import { type MetricCategory } from './alerting-creation-flow.types'
import { RDS_METRIC_CATEGORIES } from './rds-alert-metrics'

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

/**
 * Legacy managed PostgreSQL/MySQL databases (AWS RDS or Scaleway managed databases) run outside Kubernetes, so the
 * generic alerts have no container to watch, and the alert API has no DATABASE target. The console therefore does not
 * offer alert creation for them, whatever the cloud provider. RDS alerts exist only for RDS blueprints on AWS.
 */
export function isLegacyRdsDatabase(service?: AnyService): boolean {
  return isManagedDatabase(service) && (isServiceMYSQL(service) || isServicePostgreSQL(service))
}

export function canCreateCertificateRenewalAlert(
  enabled: boolean | undefined,
  service?: Pick<AnyService, 'serviceType'>
) {
  return enabled === true && (!service || ['APPLICATION', 'CONTAINER', 'HELM'].includes(service.serviceType))
}

export function getSelectedAlertMetrics(
  metric: string,
  templates: string | undefined,
  certificateEnabled: boolean,
  isRds = false
): MetricCategory[] {
  const availableCategories: readonly MetricCategory[] = isRds ? RDS_METRIC_CATEGORIES : METRIC_CATEGORIES
  const fromTemplates = (templates ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter((item): item is MetricCategory => availableCategories.includes(item as MetricCategory))
  const selected: MetricCategory[] =
    fromTemplates.length > 0
      ? fromTemplates
      : availableCategories.includes(metric as MetricCategory)
        ? [metric as MetricCategory]
        : [isRds ? 'rds_cpu' : 'cpu']
  return [...new Set(selected)].filter((item) => item !== 'certificate_renewal_failed' || certificateEnabled)
}
