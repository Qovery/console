import { type ClusterMetricsDto, type ClusterStatusDto } from 'qovery-ws-typescript-axios'
import { getClusterHealthAndMetricsState } from './get-cluster-health-and-metrics-state'

const health = { computed_status: { global_status: 'RUNNING' } } as ClusterStatusDto
const metrics = { nodes: [] } as unknown as ClusterMetricsDto

it('gives explicit stopped status priority over retained health and metrics', () => {
  expect(getClusterHealthAndMetricsState('STOPPED', health, metrics)).toBe('stopped')
  expect(getClusterHealthAndMetricsState('STOPPED', undefined, undefined)).toBe('stopped')
  expect(getClusterHealthAndMetricsState('DEPLOYED', health, metrics)).toBe('available')
})

it('handles independent health and metrics recovery without confusing loading and unavailable', () => {
  expect(getClusterHealthAndMetricsState('DEPLOYED', undefined, undefined)).toBe('loading')
  expect(getClusterHealthAndMetricsState('DEPLOYED', health, undefined)).toBe('loading')
  expect(getClusterHealthAndMetricsState('DEPLOYED', health, null)).toBe('unavailable')
  expect(getClusterHealthAndMetricsState('DEPLOYED', null, metrics)).toBe('unavailable')
  expect(getClusterHealthAndMetricsState('DEPLOYED', undefined, null)).toBe('unavailable')
})
