import { type ClusterMetricsDto, type ClusterStatusDto } from 'qovery-ws-typescript-axios'
import { getClusterInformationState } from './get-cluster-information-state'

const health = { computed_status: { global_status: 'RUNNING' } } as ClusterStatusDto
const metrics = { nodes: [] } as unknown as ClusterMetricsDto

it('gives explicit stopped status priority over retained health and metrics', () => {
  expect(getClusterInformationState('STOPPED', health, metrics)).toBe('stopped')
  expect(getClusterInformationState('STOPPED', undefined, undefined)).toBe('stopped')
  expect(getClusterInformationState('DEPLOYED', health, metrics)).toBe('available')
})

it('handles independent health and metrics recovery without confusing loading and unavailable', () => {
  expect(getClusterInformationState('DEPLOYED', undefined, undefined)).toBe('loading')
  expect(getClusterInformationState('DEPLOYED', health, undefined)).toBe('loading')
  expect(getClusterInformationState('DEPLOYED', health, null)).toBe('unavailable')
  expect(getClusterInformationState('DEPLOYED', 'NotFound', metrics)).toBe('unavailable')
  expect(getClusterInformationState('DEPLOYED', undefined, null)).toBe('unavailable')
})
