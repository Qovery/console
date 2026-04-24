import * as Dialog from '@radix-ui/react-dialog'
import { Link } from '@tanstack/react-router'
import type { Cluster, ClusterStatus } from 'qovery-typescript-axios'
import { Heading, Icon, Section, Tooltip } from '@qovery/shared/ui'
import { pluralize } from '@qovery/shared/util-js'
import { ClusterBadges } from '../cluster-badges/cluster-badges'
import {
  CLUSTER_HEALTH_ISSUE_META,
  type ClusterHealthIssueKind,
} from '../cluster-production-health-summary-card/get-cluster-health-issues'

export interface ClusterWithHealthIssues {
  cluster: Cluster
  deploymentStatus?: ClusterStatus
  issues: ClusterHealthIssueKind[]
}

export interface ClusterProductionHealthIssuesGroup {
  kind: ClusterHealthIssueKind
  entries: ClusterWithHealthIssues[]
}

export interface ClusterProductionHealthIssuesModalProps {
  groups: ClusterProductionHealthIssuesGroup[]
  count: number
  onClose: () => void
}

export function ClusterProductionHealthIssuesModal({
  groups,
  count,
  onClose,
}: ClusterProductionHealthIssuesModalProps) {
  return (
    <Section className="flex flex-col gap-5 p-5">
      <div className="flex flex-col gap-1.5">
        <Dialog.Title asChild>
          <Heading level={1} className="text-2xl text-neutral">
            Clusters health issues report
          </Heading>
        </Dialog.Title>
        <Dialog.Description className="text-ssm text-neutral-subtle">
          We have detected{' '}
          <strong className="text-neutral">
            {count} {pluralize(count, 'cluster', 'clusters')}
          </strong>{' '}
          with ongoing {pluralize(count, 'issue', 'issues')} that are affecting their runtime.
        </Dialog.Description>
      </div>
      <div className="flex flex-col gap-5">
        {groups.map((group) => {
          const meta = CLUSTER_HEALTH_ISSUE_META[group.kind]
          return (
            <div key={group.kind} className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-ssm font-medium text-neutral-subtle">
                <Icon iconName={meta.icon} className="text-xs" />
                {meta.label}
              </div>
              <div className="flex flex-col gap-2">
                {group.entries.map(({ cluster }) => (
                  <Link
                    key={cluster.id}
                    to="/organization/$organizationId/cluster/$clusterId/overview"
                    params={{ organizationId: cluster.organization.id, clusterId: cluster.id }}
                    onClick={onClose}
                    className="group flex items-center gap-2 rounded-lg border border-neutral bg-surface-neutral px-3 py-3.5 text-left text-ssm text-neutral transition-colors hover:bg-surface-neutral-subtle focus-visible:bg-surface-neutral-subtle focus-visible:outline-none"
                  >
                    <Icon name={cluster.cloud_provider} width={16} height={16} className="flex-shrink-0" />
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <Tooltip content={cluster.name}>
                        <span className="min-w-0 shrink truncate font-medium">{cluster.name}</span>
                      </Tooltip>
                      <div className="flex shrink-0 items-center gap-1">
                        <ClusterBadges cluster={cluster} size="sm" />
                      </div>
                    </div>
                    <Icon
                      iconName="angle-right"
                      className="ml-2 flex-shrink-0 text-base text-neutral-subtle transition-colors group-hover:text-neutral"
                    />
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

export default ClusterProductionHealthIssuesModal
