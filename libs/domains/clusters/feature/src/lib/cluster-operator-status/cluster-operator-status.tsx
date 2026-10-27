import { type IconName } from '@fortawesome/fontawesome-common-types'
import { useParams } from '@tanstack/react-router'
import { type ClusterOperatorFleetStatus, type ClusterOperatorStatusResponse } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { Badge, Button, StatusChip } from '@qovery/shared/ui'
import { timeAgo } from '@qovery/shared/util-dates'
import { useUpdateClusterOperator } from '../hooks/use-update-cluster-operator/use-update-cluster-operator'

export function getClusterOperatorStatusDisplay(status: ClusterOperatorFleetStatus) {
  return match(status)
    .with('CURRENT', () => ({
      label: 'Up-to-date',
      color: 'green' as const,
      chipStatus: 'DEPLOYED' as const,
      icon: { name: 'circle-check' as IconName, className: 'text-positive' },
      description: null,
    }))
    .with('DISCONNECTED', () => ({
      label: 'Disconnected',
      color: 'red' as const,
      chipStatus: 'ERROR' as const,
      icon: { name: 'circle-xmark' as IconName, className: 'text-negative' },
      description: 'No recent heartbeat was received from the Operator.',
    }))
    .with('OUTDATED_IMAGE', () => ({
      label: 'Image update available',
      color: 'yellow' as const,
      chipStatus: 'WARNING' as const,
      icon: { name: 'circle-exclamation' as IconName, className: 'text-warning' },
      description: null,
    }))
    .with('OUTDATED_CHART', () => ({
      label: 'Chart update available',
      color: 'yellow' as const,
      chipStatus: 'WARNING' as const,
      icon: { name: 'circle-exclamation' as IconName, className: 'text-warning' },
      description: null,
    }))
    .with('OUTDATED_IMAGE_AND_CHART', () => ({
      label: 'Update available',
      color: 'yellow' as const,
      chipStatus: 'WARNING' as const,
      icon: { name: 'circle-exclamation' as IconName, className: 'text-warning' },
      description: null,
    }))
    .with('TARGET_UNKNOWN', () => ({
      label: 'Target unknown',
      color: 'yellow' as const,
      chipStatus: 'WARNING' as const,
      icon: { name: 'circle-exclamation' as IconName, className: 'text-warning' },
      description: 'Qovery cannot determine the image or Helm chart version selected for this cluster.',
    }))
    .with('REPORTED_VERSION_UNKNOWN', () => ({
      label: 'Version unknown',
      color: 'yellow' as const,
      chipStatus: 'WARNING' as const,
      icon: { name: 'circle-exclamation' as IconName, className: 'text-warning' },
      description: 'The Operator is connected but does not report enough version information.',
    }))
    .with('NOT_ATTACHED', () => ({
      label: 'Not attached',
      color: 'neutral' as const,
      chipStatus: 'UNKNOWN' as const,
      icon: { name: 'circle-minus' as IconName, className: 'text-neutral-subtle' },
      description: 'This cluster is not attached to the Qovery Operator execution path.',
    }))
    .exhaustive()
}

export interface ClusterOperatorStatusProps {
  operatorStatus: ClusterOperatorStatusResponse
}

export function ClusterOperatorStatus({ operatorStatus }: ClusterOperatorStatusProps) {
  const { organizationId = '', clusterId = '' } = useParams({ strict: false })
  const { mutate: updateOperator, isLoading: isUpdating } = useUpdateClusterOperator()
  const display = getClusterOperatorStatusDisplay(operatorStatus.status)

  return (
    <section aria-label="Qovery Operator status" className="flex flex-col">
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-medium text-neutral">Qovery Operator</h2>
          {display.description && <p className="text-sm font-normal text-neutral-subtle">{display.description}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge size="sm" variant="surface" color={display.color} className="gap-1 font-medium leading-none">
            <StatusChip status={display.chipStatus} className="h-3 w-3 shrink-0" disabledTooltip />
            {display.label}
          </Badge>
          {operatorStatus.operator_connected && operatorStatus.status !== 'CURRENT' && (
            <Button
              size="sm"
              variant="outline"
              color="neutral"
              disabled={isUpdating || !operatorStatus.desired_chart_version}
              loading={isUpdating}
              onClick={() => {
                if (!operatorStatus.desired_chart_version) return
                updateOperator({
                  organizationId,
                  clusterId,
                  chartVersion: operatorStatus.desired_chart_version,
                  imageVersion: operatorStatus.desired_image_version,
                })
              }}
            >
              Update Operator
            </Button>
          )}
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-4 border-t border-neutral px-4 py-3 text-ssm font-normal">
        <div className="flex flex-col gap-1">
          <dt className="text-xs text-neutral-subtle">Last heartbeat</dt>
          <dd className="text-neutral">
            {operatorStatus.last_heartbeat ? `${timeAgo(new Date(operatorStatus.last_heartbeat))} ago` : 'Never'}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-neutral-subtle">Operator image</dt>
          <dd className="text-neutral">{operatorStatus.operator_version ?? 'Not reported'}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-neutral-subtle">Helm chart</dt>
          <dd className="text-neutral">{operatorStatus.reported_chart_version ?? 'Not reported'}</dd>
        </div>
      </dl>
    </section>
  )
}

export default ClusterOperatorStatus
