import { useParams } from '@tanstack/react-router'
import { Callout, Icon } from '@qovery/shared/ui'
import { useClusterRunningStatus } from '../hooks/use-cluster-running-status/use-cluster-running-status'
import { getClusterQuotaWarning } from './cluster-quota-warning'

export function ClusterQuotaWarningCallout() {
  const { organizationId = '', clusterId = '' } = useParams({ strict: false })
  const { data: runningStatus } = useClusterRunningStatus({ organizationId, clusterId })
  const quotaWarning = getClusterQuotaWarning(runningStatus)

  if (!quotaWarning) {
    return null
  }

  return (
    <Callout.Root color="yellow">
      <Callout.Icon>
        <Icon iconName="triangle-exclamation" iconStyle="regular" />
      </Callout.Icon>
      <Callout.Text>
        <Callout.TextHeading>
          {quotaWarning.provider} quota issue: {quotaWarning.quota_name}
        </Callout.TextHeading>
        <Callout.TextDescription className="flex flex-col gap-1">
          <span>{quotaWarning.message}</span>
          <span>Impacted resource: {quotaWarning.resource}</span>
          <span>{quotaWarning.suggested_action}</span>
        </Callout.TextDescription>
      </Callout.Text>
    </Callout.Root>
  )
}

export default ClusterQuotaWarningCallout
