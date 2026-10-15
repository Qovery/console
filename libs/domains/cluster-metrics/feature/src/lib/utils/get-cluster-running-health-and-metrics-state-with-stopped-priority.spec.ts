import { type ClusterMetricsDto, type ClusterStatusDto } from 'qovery-ws-typescript-axios'
import { getClusterRunningHealthAndMetricsStateWithStoppedPriority } from './get-cluster-running-health-and-metrics-state-with-stopped-priority'

const health = { computed_status: { global_status: 'RUNNING' } } as ClusterStatusDto
const metrics = { nodes: [] } as unknown as ClusterMetricsDto

it('gives explicit stopped status priority over retained health and metrics', () => {
  expect(getClusterRunningHealthAndMetricsStateWithStoppedPriority('STOPPED', health, metrics)).toBe('stopped')
  expect(getClusterRunningHealthAndMetricsStateWithStoppedPriority('STOPPED', undefined, undefined)).toBe('stopped')
  expect(getClusterRunningHealthAndMetricsStateWithStoppedPriority('DEPLOYED', health, metrics)).toBe('available')
})

it('handles independent health and metrics recovery without confusing loading and unavailable', () => {
  expect(getClusterRunningHealthAndMetricsStateWithStoppedPriority('DEPLOYED', undefined, undefined)).toBe('loading')
  expect(getClusterRunningHealthAndMetricsStateWithStoppedPriority('DEPLOYED', health, undefined)).toBe('loading')
  expect(getClusterRunningHealthAndMetricsStateWithStoppedPriority('DEPLOYED', health, null)).toBe('unavailable')
  expect(getClusterRunningHealthAndMetricsStateWithStoppedPriority('DEPLOYED', null, metrics)).toBe('unavailable')
  expect(getClusterRunningHealthAndMetricsStateWithStoppedPriority('DEPLOYED', undefined, null)).toBe('unavailable')
})
