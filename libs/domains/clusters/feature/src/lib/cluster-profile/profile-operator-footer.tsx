import { useParams } from '@tanstack/react-router'
import { Icon, LoaderSpinner, Tooltip } from '@qovery/shared/ui'
import {
  ClusterOperatorStatus,
  getClusterOperatorStatusDisplay,
} from '../cluster-operator-status/cluster-operator-status'
import { useClusterOperatorStatus } from '../hooks/use-cluster-operator-status/use-cluster-operator-status'

const OPERATOR_STATUS_REFRESH_INTERVAL = 30_000

export function ProfileOperatorFooter() {
  const { organizationId = '', clusterId = '' } = useParams({ strict: false })
  const {
    data: operatorStatus,
    isLoading,
    isError,
  } = useClusterOperatorStatus({
    organizationId,
    clusterId,
    refetchInterval: OPERATOR_STATUS_REFRESH_INTERVAL,
    stopPollingWhenMissing: true,
  })

  // Clusters without Operator state (q-core answers 404) have no Operator to describe.
  if (!isLoading && !isError && !operatorStatus) return null

  const display = operatorStatus && !isError ? getClusterOperatorStatusDisplay(operatorStatus.status) : undefined

  const trigger = (
    <button
      type="button"
      aria-label={`Qovery Operator: ${display?.label ?? (isError ? 'status unavailable' : 'loading')}`}
      className="flex w-full shrink-0 items-center gap-2 bg-background-secondary p-3 text-left text-sm font-medium text-neutral outline-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-strong"
    >
      Qovery Operator
      {display ? (
        <Icon iconName={display.icon.name} iconStyle="regular" className={`text-sm ${display.icon.className}`} />
      ) : isError ? (
        <Icon iconName="circle-exclamation" iconStyle="regular" className="text-sm text-warning" />
      ) : (
        <LoaderSpinner className="w-3" />
      )}
    </button>
  )

  if (isError) {
    return (
      <Tooltip side="right" content="The Operator status could not be retrieved">
        {trigger}
      </Tooltip>
    )
  }

  return operatorStatus ? (
    <Tooltip
      side="right"
      align="end"
      collisionPadding={8}
      classNameContent="w-[480px] rounded-lg border border-neutral bg-surface-neutral p-4 text-neutral shadow-lg"
      classNameArrow="fill-surface-neutral"
      content={<ClusterOperatorStatus operatorStatus={operatorStatus} />}
    >
      {trigger}
    </Tooltip>
  ) : (
    trigger
  )
}

export default ProfileOperatorFooter
