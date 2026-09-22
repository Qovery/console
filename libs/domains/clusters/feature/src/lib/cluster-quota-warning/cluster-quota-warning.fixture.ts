import { type ClusterQuotaWarning } from './cluster-quota-warning'

export const activeQuotaWarning = {
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
} satisfies ClusterQuotaWarning
