import * as Dialog from '@radix-ui/react-dialog'
import { type ClusterCredentials, type CredentialCluster } from 'qovery-typescript-axios'
import { CLUSTER_SETTINGS_CREDENTIALS_URL, CLUSTER_SETTINGS_URL, CLUSTER_URL } from '@qovery/shared/routes'
import { Heading, Link, Section } from '@qovery/shared/ui'
import { pluralize } from '@qovery/shared/util-js'
import { ClusterAvatar } from '../cluster-avatar/cluster-avatar'

export interface CredentialsListClustersModalProps {
  clusters: CredentialCluster[]
  onClose: (response?: ClusterCredentials) => void
  credential: ClusterCredentials
  organizationId: string
}

export function CredentialsListClustersModal({
  clusters,
  organizationId,
  credential,
}: CredentialsListClustersModalProps) {
  return (
    <Section className="p-5">
      <Dialog.Title asChild>
        <Heading level={1} className="mb-2 max-w-sm text-2xl text-neutral">
          Attached {pluralize(clusters.length, 'cluster', 'clusters')} ({clusters.length})
        </Heading>
      </Dialog.Title>
      <Dialog.Description className="mb-6 text-sm text-neutral-subtle">
        Credential: {credential.name}
      </Dialog.Description>
      <div className="flex flex-col gap-y-1 rounded border border-neutral bg-surface-neutral-subtle p-2">
        {clusters.map((cluster) => (
          <Link
            key={cluster.id}
            to={`${CLUSTER_URL(organizationId, cluster.id)}${CLUSTER_SETTINGS_URL}${CLUSTER_SETTINGS_CREDENTIALS_URL}`}
            target="_blank"
            rel="noreferrer"
            color="brand"
          >
            <div className="text-brand-solid hover:text-brand-solidHover flex items-center gap-1.5 text-sm font-medium">
              <ClusterAvatar cloudProvider={cluster.cloud_provider} size="sm" />
              {cluster.name}
            </div>
          </Link>
        ))}
      </div>
    </Section>
  )
}

export default CredentialsListClustersModal
