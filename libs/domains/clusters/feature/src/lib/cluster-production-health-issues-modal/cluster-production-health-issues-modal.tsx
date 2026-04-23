import * as Dialog from '@radix-ui/react-dialog'
import { Link } from '@tanstack/react-router'
import type { Cluster, ClusterStatus } from 'qovery-typescript-axios'
import { Heading, Icon, Section } from '@qovery/shared/ui'
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
                  <div
                    key={cluster.id}
                    className="group relative rounded-lg border border-neutral bg-surface-neutral px-3 py-3.5 text-left text-ssm text-neutral transition-colors focus-within:bg-surface-neutral-subtle hover:bg-surface-neutral-subtle"
                  >
                    <Link
                      to="/organization/$organizationId/cluster/$clusterId/overview"
                      params={{ organizationId: cluster.organization.id, clusterId: cluster.id }}
                      onClick={onClose}
                      className="absolute inset-0 rounded-lg"
                    />
                    <div className="pointer-events-none relative flex items-center gap-2">
                      <Icon name={cluster.cloud_provider} width={16} height={16} />
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="truncate font-medium">{cluster.name}</span>
                        <span className="block h-2 w-px border-l border-neutral" />
                        <div className="flex min-w-0 flex-wrap gap-1">
                          <ClusterBadges cluster={cluster} size="sm" />
                        </div>
                      </div>
                      <Icon
                        iconName="angle-right"
                        className="ml-auto text-base text-neutral-subtle transition-colors group-hover:text-neutral"
                      />
                    </div>
                  </div>
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
