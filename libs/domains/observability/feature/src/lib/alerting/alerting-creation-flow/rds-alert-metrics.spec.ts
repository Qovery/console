import {
  RDS_METRIC_CATEGORIES,
  fromRdsMetricThreshold,
  getRdsAlertQuery,
  toRdsMetricThreshold,
} from './rds-alert-metrics'

describe('RDS alert metrics', () => {
  const dbInstance = 'z04d06b19-postgresql'

  it.each(RDS_METRIC_CATEGORIES)('generates a query scoped to one RDS instance for %s', (category) => {
    expect(getRdsAlertQuery(category, dbInstance)).toContain(`{dimension_DBInstanceIdentifier="${dbInstance}"}`)
  })

  it('keeps the latest CloudWatch point for 10 minutes so delayed exports do not reset the alert', () => {
    expect(getRdsAlertQuery('rds_cpu', dbInstance)).toBe(
      `last_over_time(aws_rds_cpuutilization_average{dimension_DBInstanceIdentifier="${dbInstance}"}[10m])`
    )
  })

  it.each([
    ['rds_read_latency', 'aws_rds_read_latency_average'],
    ['rds_write_latency', 'aws_rds_write_latency_average'],
  ] as const)('queries the %s CloudWatch metric in seconds', (category, metric) => {
    expect(getRdsAlertQuery(category, dbInstance)).toBe(
      `last_over_time(${metric}{dimension_DBInstanceIdentifier="${dbInstance}"}[10m])`
    )
  })

  it('rejects invalid instance identifiers before interpolating them in PromQL', () => {
    expect(getRdsAlertQuery('rds_cpu', 'db"} or vector(1)')).toBeUndefined()
  })

  it.each([
    ['rds_cpu', 80, 80],
    ['rds_connections', 300, 300],
    ['rds_freeable_memory', 400, 419430400],
    ['rds_free_storage_space', 10, 10737418240],
    ['rds_read_latency', 100, 0.1],
    ['rds_write_latency', 250, 0.25],
  ] as const)('converts %s between UI and Prometheus units', (category, displayed, raw) => {
    expect(toRdsMetricThreshold(category, displayed)).toBe(raw)
    expect(fromRdsMetricThreshold(category, raw)).toBe(displayed)
  })
})
