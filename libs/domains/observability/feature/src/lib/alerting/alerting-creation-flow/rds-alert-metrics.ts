import { RDS_INSTANCE_IDENTIFIER } from '../../util/get-blueprint-db-instance'

export const RDS_METRIC_CATEGORIES = [
  'rds_cpu',
  'rds_connections',
  'rds_freeable_memory',
  'rds_free_storage_space',
  'rds_read_latency',
  'rds_write_latency',
] as const

export type RdsMetricCategory = (typeof RDS_METRIC_CATEGORIES)[number]

type RdsMetricDefinition = {
  label: string
  metric: string
  unit: '%' | 'connections' | 'MiB' | 'GiB' | 'ms'
  defaultThreshold: number
  operator: 'ABOVE' | 'BELOW'
  multiplier: number
}

const MEBIBYTE = 1024 ** 2
const GIBIBYTE = 1024 ** 3

export const RDS_METRICS: Record<RdsMetricCategory, RdsMetricDefinition> = {
  rds_cpu: {
    label: 'RDS CPU utilization',
    metric: 'aws_rds_cpuutilization_average',
    unit: '%',
    defaultThreshold: 80,
    operator: 'ABOVE',
    multiplier: 1,
  },
  rds_connections: {
    label: 'RDS connections',
    metric: 'aws_rds_database_connections_average',
    unit: 'connections',
    defaultThreshold: 300,
    operator: 'ABOVE',
    multiplier: 1,
  },
  rds_freeable_memory: {
    label: 'RDS freeable memory',
    metric: 'aws_rds_freeable_memory_average',
    unit: 'MiB',
    defaultThreshold: 400,
    operator: 'BELOW',
    multiplier: MEBIBYTE,
  },
  rds_free_storage_space: {
    label: 'RDS free storage space',
    metric: 'aws_rds_free_storage_space_average',
    unit: 'GiB',
    defaultThreshold: 10,
    operator: 'BELOW',
    multiplier: GIBIBYTE,
  },
  rds_read_latency: {
    label: 'RDS read latency',
    metric: 'aws_rds_read_latency_average',
    unit: 'ms',
    defaultThreshold: 100,
    operator: 'ABOVE',
    multiplier: 1 / 1000,
  },
  rds_write_latency: {
    label: 'RDS write latency',
    metric: 'aws_rds_write_latency_average',
    unit: 'ms',
    defaultThreshold: 100,
    operator: 'ABOVE',
    multiplier: 1 / 1000,
  },
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

export function toRdsMetricThreshold(category: RdsMetricCategory, threshold: number): number {
  return threshold * RDS_METRICS[category].multiplier
}

export function fromRdsMetricThreshold(category: RdsMetricCategory, threshold: number): number {
  return threshold / RDS_METRICS[category].multiplier
}
