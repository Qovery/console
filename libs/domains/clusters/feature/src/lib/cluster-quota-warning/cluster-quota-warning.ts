import { type ClusterStatusDto } from 'qovery-ws-typescript-axios'

// The cluster status websocket (`cluster/status`) exposes an AWS quota warning on
// `computed_status.quota_warning` when Karpenter cannot create new nodes because a
// quota has been reached (QOV-2276). This field is not yet part of
// `qovery-ws-typescript-axios`, so we describe its shape locally and read it through
// a narrowed type. Drop this local type once the generated package exposes it.
export type ClusterQuotaWarningStatus = 'ACTIVE' | 'INACTIVE'

export interface ClusterQuotaWarning {
  status: ClusterQuotaWarningStatus
  provider: string
  source: string
  quota_code: string
  quota_name: string
  resource: string
  region?: string | null
  message: string
  suggested_action: string
  detected_at: number
  last_seen_at: number
}

type ClusterComputedStatusWithQuotaWarning = ClusterStatusDto['computed_status'] & {
  quota_warning?: ClusterQuotaWarning | null
}

// Returns the quota warning only while it is active, so callers can simply check for
// a truthy value to decide whether to surface it.
export function getClusterQuotaWarning(
  runningStatus: ClusterStatusDto | 'NotFound' | null | undefined
): ClusterQuotaWarning | null {
  if (!runningStatus || typeof runningStatus === 'string') {
    return null
  }

  const computedStatus = runningStatus.computed_status as ClusterComputedStatusWithQuotaWarning | undefined
  const quotaWarning = computedStatus?.quota_warning

  if (!quotaWarning || quotaWarning.status !== 'ACTIVE') {
    return null
  }

  return quotaWarning
}
