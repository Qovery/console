import { type CheckedState } from '@radix-ui/react-checkbox'
import { type Cluster, ClusterDeleteMode } from 'qovery-typescript-axios'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { match } from 'ts-pattern'
import { CLUSTERS_URL } from '@qovery/shared/routes'
import { Callout, Checkbox, Icon, InputSelect, ModalConfirmation } from '@qovery/shared/ui'
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
  const [confirmQoveryConfigChecked, setConfirmQoveryConfigChecked] = useState<CheckedState>()
  const [confirmKubernetesChecked, setConfirmKubernetesChecked] = useState<CheckedState>()
  const [confirmCloudProviderChecked, setConfirmCloudProviderChecked] = useState<CheckedState>()

  const formattedClusterDeleteMode = (clusterDeleteMode: ClusterDeleteMode) =>
    match(clusterDeleteMode)
      .with('DEFAULT', () => 'Default')
      .with('DELETE_CLUSTER_AND_QOVERY_CONFIG', () => 'Cluster and Qovery config')
      .with('DELETE_QOVERY_CONFIG', () => 'Qovery Config only')
      .exhaustive()
  const navigate = useNavigate()

  const ctaButtonDisabled =
    (kubernetes === 'SELF_MANAGED' ? confirmKubernetesChecked !== true : confirmCloudProviderChecked !== true) ||
    confirmQoveryConfigChecked !== true

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
      ctaButtonDisabled={ctaButtonDisabled}
      isDelete
    >
      <div className="mb-6 rounded border border-red-500 bg-red-50 p-4 text-sm text-neutral-400">
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
        <p className="font-medium">
          Use it carefully this action is irreversible. Please confirm that you are aware that this operation will
          delete:
        </p>

        <p className="flex flex-col">
          {cluster.kubernetes === 'SELF_MANAGED' ? (
            <div className="flex flex-1 flex-row gap-3 py-2">
              <Checkbox
                name="confirm_kubernetes"
                id="confirm_kubernetes"
                className="shrink-0"
                color="red"
                checked={confirmKubernetesChecked}
                onCheckedChange={setConfirmKubernetesChecked}
              />
              <label htmlFor="confirm_kubernetes">
                <span className="font-medium">Kubernetes</span>: nothing will be deleted on your cluster. You will have
                to manually delete any deployed application and uninstall the Qovery helm chart from your cluster.
              </label>
            </div>
          ) : (
            <div className="flex flex-1 flex-row gap-3 py-2">
              <Checkbox
                name="confirm_cloud_provider"
                id="confirm_cloud_provider"
                className="shrink-0"
                color="red"
                checked={confirmCloudProviderChecked}
                onCheckedChange={setConfirmCloudProviderChecked}
              />
              <label htmlFor="confirm_cloud_provider">
                <span className="font-medium">Cloud provider:</span>{' '}
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
              </label>
            </div>
          )}
          <div className="flex flex-row gap-3 py-2">
            <Checkbox
              name="confirm_qovery_config"
              id="confirm_qovery_config"
              className="shrink-0"
              color="red"
              checked={confirmQoveryConfigChecked}
              onCheckedChange={setConfirmQoveryConfigChecked}
            />
            <label htmlFor="confirm_qovery_config">
              <span className="font-medium">Qovery organization:</span> the configuration of this cluster and any linked
              environment.
            </label>
          </div>
        </p>
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
