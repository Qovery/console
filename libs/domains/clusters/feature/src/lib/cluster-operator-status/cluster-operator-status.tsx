import { type IconName } from '@fortawesome/fontawesome-common-types'
import { type ClusterOperatorFleetStatus, type ClusterOperatorStatusResponse } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { Badge, Button, StatusChip } from '@qovery/shared/ui'
import { timeAgo } from '@qovery/shared/util-dates'
import { useUpdateClusterOperator } from '../hooks/use-update-cluster-operator/use-update-cluster-operator'

export function getClusterOperatorStatusDisplay(status: ClusterOperatorFleetStatus) {
  return match(status)
    .with('CURRENT', () => ({
      label: 'Versions current',
      color: 'green' as const,
      chipStatus: 'DEPLOYED' as const,
      icon: { name: 'circle-check' as IconName, className: 'text-positive' },
      description: 'The Operator is connected and runs the selected image and Helm chart versions.',
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
      description: 'The installed Operator image differs from the selected version.',
    }))
    .with('OUTDATED_CHART', () => ({
      label: 'Chart update available',
      color: 'yellow' as const,
      chipStatus: 'WARNING' as const,
      icon: { name: 'circle-exclamation' as IconName, className: 'text-warning' },
      description: 'The installed Helm chart differs from the selected version.',
    }))
    .with('OUTDATED_IMAGE_AND_CHART', () => ({
      label: 'Update available',
      color: 'yellow' as const,
      chipStatus: 'WARNING' as const,
      icon: { name: 'circle-exclamation' as IconName, className: 'text-warning' },
      description: 'The installed Operator image and Helm chart differ from the selected versions.',
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

function Version({ installed, target }: { installed?: string | null; target?: string | null }) {
  return (
    <span className="flex flex-col">
      <span className="font-medium text-neutral">{installed ?? 'Not reported'}</span>
      <span className="text-ssm text-neutral-subtle">Target: {target ?? 'Unknown'}</span>
    </span>
  )
}

export interface ClusterOperatorStatusProps {
  organizationId: string
  clusterId: string
  operatorStatus: ClusterOperatorStatusResponse
}

export function ClusterOperatorStatus({ organizationId, clusterId, operatorStatus }: ClusterOperatorStatusProps) {
  const { mutate: updateOperator, isLoading: isUpdating } = useUpdateClusterOperator()
  const display = getClusterOperatorStatusDisplay(operatorStatus.status)

  return (
    <section aria-label="Qovery Operator status" className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-medium text-neutral">Qovery Operator</h2>
          <p className="text-sm font-normal text-neutral-subtle">{display.description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge size="sm" variant="surface" color={display.color} className="gap-1.5">
            <StatusChip status={display.chipStatus} disabledTooltip />
            {display.label}
          </Badge>
          {operatorStatus.operator_connected && (
            <Button
              size="sm"
              variant="outline"
              color="neutral"
              disabled={!operatorStatus.desired_chart_version}
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

      <dl className="grid grid-cols-3 gap-4 border-t border-neutral pt-4 text-sm font-normal">
        <div className="flex flex-col gap-1">
          <dt className="text-neutral-subtle">Last heartbeat</dt>
          <dd className="font-medium text-neutral">
            {operatorStatus.last_heartbeat ? `${timeAgo(new Date(operatorStatus.last_heartbeat))} ago` : 'Never'}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-neutral-subtle">Operator image</dt>
          <dd>
            <Version installed={operatorStatus.operator_version} target={operatorStatus.desired_image_version} />
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-neutral-subtle">Helm chart</dt>
          <dd>
            <Version installed={operatorStatus.reported_chart_version} target={operatorStatus.desired_chart_version} />
          </dd>
        </div>
      </dl>
    </section>
  )
}

export default ClusterOperatorStatus
