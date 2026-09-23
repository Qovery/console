import { type ClusterQuotaWarningDto, type ClusterStatusDto } from 'qovery-ws-typescript-axios'
import { getClusterQuotaWarning } from './cluster-quota-warning'

const activeQuotaWarning = {
  status: 'ACTIVE',
  provider: 'AWS',
  source: 'KARPENTER_EVENT',
  quota_code: 'MaxSpotInstanceCountExceeded',
  quota_name: 'Spot Instance requests',
  resource: 'EC2 Spot instances',
  region: null,
  message: 'AWS refused to create new nodes because the Spot Instance requests quota has been reached.',
  suggested_action: 'Request an AWS quota increase, then retry or wait for the cluster to scale again.',
  detected_at: 1790004098000,
  last_seen_at: 1790004098000,
} satisfies ClusterQuotaWarningDto

function buildRunningStatus(quota_warning?: Partial<ClusterQuotaWarningDto> | null): ClusterStatusDto {
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
