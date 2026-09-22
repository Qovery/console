import { type ClusterStatusDto } from 'qovery-ws-typescript-axios'
import { type ClusterQuotaWarning, getClusterQuotaWarning } from './cluster-quota-warning'
import { activeQuotaWarning } from './cluster-quota-warning.fixture'

function buildRunningStatus(quota_warning?: Partial<ClusterQuotaWarning> | null): ClusterStatusDto {
  return {
    computed_status: {
      global_status: 'WARNING',
      quota_warning,
    },
  } as unknown as ClusterStatusDto
}

describe('getClusterQuotaWarning', () => {
  it('returns null when running status is undefined', () => {
    expect(getClusterQuotaWarning(undefined)).toBeNull()
  })

  it('returns null when running status is "NotFound"', () => {
    expect(getClusterQuotaWarning('NotFound')).toBeNull()
  })

  it('returns null when there is no quota warning', () => {
    expect(getClusterQuotaWarning(buildRunningStatus())).toBeNull()
  })

  it('returns null when the quota warning is not active', () => {
    expect(getClusterQuotaWarning(buildRunningStatus({ ...activeQuotaWarning, status: 'INACTIVE' }))).toBeNull()
  })

  it('returns the quota warning when it is active', () => {
    expect(getClusterQuotaWarning(buildRunningStatus(activeQuotaWarning))).toEqual(activeQuotaWarning)
  })
})
