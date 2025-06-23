import * as Dialog from '@radix-ui/react-dialog'
import { type ClusterCredentials, type CredentialCluster } from 'qovery-typescript-axios'
import { Link } from 'react-router-dom'
import { CLUSTER_URL } from '@qovery/shared/routes'
import { Callout, Heading, Icon, Section } from '@qovery/shared/ui'
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
        <Heading level={1} className="mb-2 max-w-sm text-2xl text-neutral-400">
          Attached {pluralize(clusters.length, 'cluster', 'clusters')} ({clusters.length})
        </Heading>
      </Dialog.Title>
      <Dialog.Description className="mb-6 text-sm text-neutral-350">Credential: {credential.name}</Dialog.Description>
      <div className="flex flex-col gap-y-4">
        <Callout.Root color="yellow">
          <Callout.Icon>
            <Icon iconName="circle-info" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>
            The credential change won't be applied to the mirroring registry of this cluster.
            <br />
            Make sure to update the credentials properly in this cluster's mirroring registry section.
          </Callout.Text>
        </Callout.Root>

        <div className="flex flex-col gap-y-4 rounded border border-neutral-250 bg-neutral-100 p-2">
          {clusters.map((cluster) => (
            <Link key={cluster.id} to={CLUSTER_URL(organizationId, cluster.id)} target="_blank" rel="noreferrer">
              <div className="flex items-center gap-1 text-sm font-semibold text-brand-500 hover:text-brand-600">
                <ClusterAvatar cloudProvider={cluster.cloud_provider} size="sm" />
                {cluster.name}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Section>
  )
}

export default CredentialsListClustersModal
