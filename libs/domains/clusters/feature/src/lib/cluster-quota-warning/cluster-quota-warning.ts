import { type ClusterQuotaWarningDto, type ClusterStatusDto } from 'qovery-ws-typescript-axios'

// Returns the quota warning only while it is active, so callers can simply check for
// a truthy value to decide whether to surface it.
export function getClusterQuotaWarning(
  runningStatus: ClusterStatusDto | 'NotFound' | null | undefined
): ClusterQuotaWarningDto | null {
  if (!runningStatus || typeof runningStatus === 'string') {
    return null
  }

  const quotaWarning = runningStatus.computed_status?.quota_warning

  if (!quotaWarning || quotaWarning.status !== 'ACTIVE') {
    return null
  }

  return quotaWarning
}
