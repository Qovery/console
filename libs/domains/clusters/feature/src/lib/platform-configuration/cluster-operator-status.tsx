import { type ClusterOperatorFleetStatus } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { Badge, Button, Callout, Heading, Icon, LoaderSpinner, StatusChip } from '@qovery/shared/ui'
import { timeAgo } from '@qovery/shared/util-dates'
import { useClusterOperatorStatus } from './hooks/use-cluster-operator'

interface ClusterOperatorStatusProps {
  clusterId: string
  organizationId: string
}

function statusDisplay(status: ClusterOperatorFleetStatus) {
  return match(status)
    .with('CURRENT', () => ({
      label: 'Up to date',
      color: 'green' as const,
      chipStatus: 'DEPLOYED' as const,
      description: 'The Operator is connected and runs the selected image and Helm chart versions.',
    }))
    .with('DISCONNECTED', () => ({
      label: 'Disconnected',
      color: 'red' as const,
      chipStatus: 'ERROR' as const,
      description: 'No recent heartbeat was received from the Operator.',
    }))
    .with('OUTDATED_IMAGE', () => ({
      label: 'Image update available',
      color: 'yellow' as const,
      chipStatus: 'WARNING' as const,
      description: 'The installed Operator image differs from the selected version.',
    }))
    .with('OUTDATED_CHART', () => ({
      label: 'Chart update available',
      color: 'yellow' as const,
      chipStatus: 'WARNING' as const,
      description: 'The installed Helm chart differs from the selected version.',
    }))
    .with('OUTDATED_IMAGE_AND_CHART', () => ({
      label: 'Update available',
      color: 'yellow' as const,
      chipStatus: 'WARNING' as const,
      description: 'The installed Operator image and Helm chart differ from the selected versions.',
    }))
    .with('TARGET_UNKNOWN', () => ({
      label: 'Target unknown',
      color: 'yellow' as const,
      chipStatus: 'WARNING' as const,
      description: 'Qovery cannot determine the image or Helm chart version selected for this cluster.',
    }))
    .with('REPORTED_VERSION_UNKNOWN', () => ({
      label: 'Version unknown',
      color: 'yellow' as const,
      chipStatus: 'WARNING' as const,
      description: 'The Operator is connected but does not report enough version information.',
    }))
    .with('NOT_ATTACHED', () => ({
      label: 'Not attached',
      color: 'neutral' as const,
      chipStatus: 'UNKNOWN' as const,
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

export function ClusterOperatorStatus({ clusterId, organizationId }: ClusterOperatorStatusProps) {
  const { data, isLoading, isError, refetch } = useClusterOperatorStatus({ organizationId, clusterId })

  if (isLoading) {
    return (
      <div className="flex min-h-28 items-center justify-center rounded-lg border border-neutral">
        <LoaderSpinner className="w-4" />
      </div>
    )
  }

  if (isError) {
    return (
      <Callout.Root color="red">
        <Callout.Icon>
          <Icon iconName="circle-exclamation" iconStyle="regular" />
        </Callout.Icon>
        <Callout.Text>
          <Callout.TextHeading>Unable to load the Operator status.</Callout.TextHeading>
          <Button size="xs" className="mt-3" onClick={() => void refetch()}>
            Retry
          </Button>
        </Callout.Text>
      </Callout.Root>
    )
  }

  const status = data?.status ?? 'NOT_ATTACHED'
  const display = statusDisplay(status)

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-neutral p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Heading level={2}>Qovery Operator</Heading>
          <p className="text-sm text-neutral-subtle">{display.description}</p>
        </div>
        <Badge size="sm" variant="surface" color={display.color} className="shrink-0 gap-1.5">
          <StatusChip status={display.chipStatus} disabledTooltip />
          {display.label}
        </Badge>
      </div>

      <dl className="grid gap-4 border-t border-neutral pt-4 text-sm sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <dt className="text-neutral-subtle">Last heartbeat</dt>
          <dd className="font-medium text-neutral">
            {data?.last_heartbeat ? `${timeAgo(new Date(data.last_heartbeat))} ago` : 'Never'}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-neutral-subtle">Operator image</dt>
          <dd>
            <Version installed={data?.operator_version} target={data?.desired_image_version} />
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-neutral-subtle">Helm chart</dt>
          <dd>
            <Version installed={data?.reported_chart_version} target={data?.desired_chart_version} />
          </dd>
        </div>
      </dl>
    </section>
  )
}
