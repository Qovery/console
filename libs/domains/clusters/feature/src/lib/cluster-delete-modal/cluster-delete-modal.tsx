import { type Cluster, ClusterDeleteMode } from 'qovery-typescript-axios'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CLUSTERS_URL } from '@qovery/shared/routes'
import { Callout, Icon, InputSelect, ModalConfirmation } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
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
  const { mutateAsync } = useDeleteCluster()
  const [clusterDeleteMode, setClusterDeleteMode] = useState<ClusterDeleteMode>(ClusterDeleteMode.DEFAULT)

  const formattedClusterDeleteMode = (clusterDeleteMode: string) =>
    clusterDeleteMode
      .split('_')
      .map((word) => upperCaseFirstLetter(word))
      .join(' ')
  const navigate = useNavigate()

  return (
    <ModalConfirmation
      title="Confirm deletion cluster"
      name={name}
      callback={async () => {
        try {
          await mutateAsync({
            organizationId,
            clusterId,
            clusterDeleteMode,
          })
          navigate(CLUSTERS_URL(organizationId))
        } catch (error) {
          console.error(error)
        }
      }}
      isDelete
    >
      <div className="border border-red-500 rounded bg-red-50 text-sm text-neutral-400 p-4 mb-6">
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
        <p>This operation will delete:</p>

        <ul className="list-disc pl-5">
          {clusterDeleteMode === ClusterDeleteMode.DEFAULT && (
            <li>
              <b>Cloud provider</b>: any resource created by Qovery on your cloud provider account to run this cluster
              will be deleted, including any application running on it.{' '}
            </li>
          )}
          {clusterDeleteMode === ClusterDeleteMode.DELETE_CLUSTER_AND_QOVERY_CONFIG && (
            <li>
              <b>Cloud provider</b>: any resource created by Qovery on your cloud provider account to run this cluster
              will be deleted, including any application running on it. Any cloud provider managed service deployed via
              Qovery will NOT be deleted.{' '}
            </li>
          )}
          {clusterDeleteMode === ClusterDeleteMode.DELETE_QOVERY_CONFIG && (
            <li>
              <b>Cloud provider</b>: nothing will be deleted on your cloud provider account. You will have to manually
              delete any resource created by Qovery directly from your cloud provider console.{' '}
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
                <li>the S3 bucket created during the cluster installation</li>
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
