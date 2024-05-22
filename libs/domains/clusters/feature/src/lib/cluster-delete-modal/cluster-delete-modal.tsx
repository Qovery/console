import { type Cluster, ClusterDeleteMode } from 'qovery-typescript-axios'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { match } from 'ts-pattern'
import { CLUSTERS_URL } from '@qovery/shared/routes'
import { Callout, Icon, InputSelect, ModalConfirmation } from '@qovery/shared/ui'
import useDeleteCluster from '../hooks/use-delete-cluster/use-delete-cluster'

export interface ClusterDeleteModalProps {
  cluster: Cluster
}

export function ClusterDeleteModal({ cluster }: ClusterDeleteModalProps) {
  const {
    organization: { id: organizationId },
    name,
    kubernetes,
    id: clusterId,
  } = cluster
  const { mutateAsync: deleteCluster } = useDeleteCluster()
  const [clusterDeleteMode, setClusterDeleteMode] = useState<ClusterDeleteMode>(ClusterDeleteMode.DEFAULT)

  const formattedClusterDeleteMode = (clusterDeleteMode: ClusterDeleteMode) =>
    match(clusterDeleteMode)
      .with('DEFAULT', () => 'Default')
      .with('DELETE_CLUSTER_AND_QOVERY_CONFIG', () => 'Cluster and Qovery config')
      .with('DELETE_QOVERY_CONFIG', () => 'Qovery Config only')
      .exhaustive()
  const navigate = useNavigate()

  return (
    <ModalConfirmation
      title="Confirm deletion cluster"
      name={name}
      callback={async () => {
        try {
          await deleteCluster({
            organizationId,
            clusterId,
            clusterDeleteMode: cluster.kubernetes === 'SELF_MANAGED' ? 'DELETE_QOVERY_CONFIG' : clusterDeleteMode,
          })
          navigate(CLUSTERS_URL(organizationId))
        } catch (error) {
          console.error(error)
        }
      }}
      isDelete
    >
      <div className="border border-red-500 rounded bg-red-50 text-sm text-neutral-400 p-4 mb-6">
        {cluster.kubernetes !== 'SELF_MANAGED' && (
          <InputSelect
            className="mb-3"
            label="Delete mode"
            options={Object.values(ClusterDeleteMode)
              .filter((e) => !(e === 'DELETE_CLUSTER_AND_QOVERY_CONFIG' && cluster.kubernetes === 'SELF_MANAGED'))
              .map((mode) => ({
                label: formattedClusterDeleteMode(mode),
                value: mode,
              }))}
            onChange={(value) => setClusterDeleteMode(value as ClusterDeleteMode)}
            value={clusterDeleteMode}
          />
        )}
        <p>This operation will delete:</p>

        <ul className="list-disc pl-5">
          {cluster.kubernetes === 'SELF_MANAGED' ? (
            <li>
              <b>Kubernetes</b>: nothing will be deleted on your cluster. You will have to manually delete any deployed
              application and uninstall the Qovery helm chart from your cluster.{' '}
            </li>
          ) : (
            <li>
              <b>Cloud provider</b>:{' '}
              {match(clusterDeleteMode)
                .with(
                  'DEFAULT',
                  () =>
                    'any resource created by Qovery on your cloud provider account to run this cluster, including any application running on it.'
                )
                .with(
                  'DELETE_CLUSTER_AND_QOVERY_CONFIG',
                  () =>
                    'any resource created by Qovery on your cloud provider account to run this cluster, including any application running on it. Managed databases deployed via Qovery will NOT be deleted.'
                )
                .with(
                  'DELETE_QOVERY_CONFIG',
                  () =>
                    'nothing will be deleted on your cloud provider account. You will have to manually delete any resource created by Qovery directly from your cloud provider console.'
                )
                .exhaustive()}
            </li>
          )}
          <li>
            <b>Qovery organization</b>: the configuration of this cluster and any linked environment.
          </li>
        </ul>
        <p>Use it carefully this action is irreversible.</p>
        {kubernetes !== 'SELF_MANAGED' && clusterDeleteMode !== ClusterDeleteMode.DELETE_QOVERY_CONFIG && (
          <Callout.Root className="mt-3 text-xs" color="yellow">
            <Callout.Icon>
              <Icon iconName="triangle-exclamation" />
            </Callout.Icon>
            <Callout.Text>
              <p>Please note that you will have to manually delete on your cloud account:</p>
              <ul className="list-disc pl-3">
                <li>the S3 bucket created at cluster installation</li>
                <li>the image registry linked to this cluster</li>
                {clusterDeleteMode === ClusterDeleteMode.DELETE_CLUSTER_AND_QOVERY_CONFIG && (
                  <li>any managed database that was created via Qovery.</li>
                )}
                <li>
                  any resource created by a lifecycle job that will not be properly deleted during the `environment
                  deletion` event.
                </li>
              </ul>
            </Callout.Text>
          </Callout.Root>
        )}
      </div>
    </ModalConfirmation>
  )
}

export default ClusterDeleteModal
