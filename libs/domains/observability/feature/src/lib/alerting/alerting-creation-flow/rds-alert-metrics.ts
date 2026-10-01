import { RDS_INSTANCE_IDENTIFIER } from '../../database/database-rds-dashboard/util/get-blueprint-db-instance'

export const RDS_METRIC_CATEGORIES = [
  'rds_cpu',
  'rds_connections',
  'rds_freeable_memory',
  'rds_free_storage_space',
  'rds_read_latency',
  'rds_write_latency',
  'rds_disk_queue_depth',
] as const

export type RdsMetricCategory = (typeof RDS_METRIC_CATEGORIES)[number]

type RdsMetricDefinition = {
  label: string
  metric: string
  /** Unit shown next to the threshold input. */
  unit: '%' | 'connections' | 'MiB' | 'GiB' | 'ms' | 'requests'
  /** Unit appended to the threshold in the generated alert description. */
  descriptionUnit: string
  defaultThreshold: number
  operator: 'ABOVE' | 'BELOW'
  /** Converts the displayed threshold into the raw CloudWatch unit. */
  multiplier: number
}

const MEBIBYTE = 1024 ** 2
const GIBIBYTE = 1024 ** 3
// CloudWatch reports RDS latency in seconds.
const MILLISECOND = 0.001

export const RDS_METRICS: Record<RdsMetricCategory, RdsMetricDefinition> = {
  rds_cpu: {
    label: 'RDS CPU utilization',
    metric: 'aws_rds_cpuutilization_average',
    unit: '%',
    descriptionUnit: '%',
    defaultThreshold: 80,
    operator: 'ABOVE',
    multiplier: 1,
  },
  rds_connections: {
    label: 'RDS connections',
    metric: 'aws_rds_database_connections_average',
    unit: 'connections',
    descriptionUnit: ' connections',
    defaultThreshold: 300,
    operator: 'ABOVE',
    multiplier: 1,
  },
  rds_freeable_memory: {
    label: 'RDS freeable memory',
    metric: 'aws_rds_freeable_memory_average',
    unit: 'MiB',
    descriptionUnit: 'MiB',
    defaultThreshold: 400,
    operator: 'BELOW',
    multiplier: MEBIBYTE,
  },
  rds_free_storage_space: {
    label: 'RDS free storage space',
    metric: 'aws_rds_free_storage_space_average',
    unit: 'GiB',
    descriptionUnit: 'GiB',
    defaultThreshold: 10,
    operator: 'BELOW',
    multiplier: GIBIBYTE,
  },
  rds_read_latency: {
    label: 'RDS read latency',
    metric: 'aws_rds_read_latency_average',
    unit: 'ms',
    descriptionUnit: ' ms',
    defaultThreshold: 20,
    operator: 'ABOVE',
    multiplier: MILLISECOND,
  },
  rds_write_latency: {
    label: 'RDS write latency',
    metric: 'aws_rds_write_latency_average',
    unit: 'ms',
    descriptionUnit: ' ms',
    defaultThreshold: 20,
    operator: 'ABOVE',
    multiplier: MILLISECOND,
  },
  rds_disk_queue_depth: {
    label: 'RDS disk queue depth',
    metric: 'aws_rds_disk_queue_depth_average',
    unit: 'requests',
    descriptionUnit: ' requests',
    defaultThreshold: 10,
    operator: 'ABOVE',
    multiplier: 1,
  },
}

/** Builds a value for every RDS metric, so per-metric tables cannot miss a new category. */
export function mapRdsMetrics<T>(mapper: (category: RdsMetricCategory) => T): Record<RdsMetricCategory, T> {
  return Object.fromEntries(RDS_METRIC_CATEGORIES.map((category) => [category, mapper(category)])) as Record<
    RdsMetricCategory,
    T
  >
}

export function isRdsMetricCategory(category: string): category is RdsMetricCategory {
  return RDS_METRIC_CATEGORIES.some((candidate) => candidate === category)
}

// CloudWatch points are exported with their own timestamp, often 3 to 5 minutes old, so the latest point
// regularly falls outside Prometheus' 5-minute lookback. Without a wider window, every such gap resets `for`.
const RDS_ALERT_LOOKBACK = '10m'

export function getRdsAlertQuery(category: RdsMetricCategory, dbInstance: string): string | undefined {
  if (!RDS_INSTANCE_IDENTIFIER.test(dbInstance)) return undefined
  return `last_over_time(${RDS_METRICS[category].metric}{dimension_DBInstanceIdentifier="${dbInstance}"}[${RDS_ALERT_LOOKBACK}])`
}

// Drops floating point noise from unit conversions (9 ms * 0.001 would otherwise give 0.009000000000000001).
const roundThreshold = (threshold: number) => Number(threshold.toPrecision(12))

export function toRdsMetricThreshold(category: RdsMetricCategory, threshold: number): number {
  return roundThreshold(threshold * RDS_METRICS[category].multiplier)
}

export function fromRdsMetricThreshold(category: RdsMetricCategory, threshold: number): number {
  return roundThreshold(threshold / RDS_METRICS[category].multiplier)
}
