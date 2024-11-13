import { type CheckedState } from '@radix-ui/react-checkbox'
import { type Cluster, ClusterDeleteMode } from 'qovery-typescript-axios'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { match } from 'ts-pattern'
import { CLUSTERS_URL } from '@qovery/shared/routes'
import { Button, Callout, Checkbox, Icon, InputSelect, InputTextSmall, useModal } from '@qovery/shared/ui'
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
  const { handleSubmit, control, watch } = useForm()
  const { closeModal } = useModal()

  const onSubmit = handleSubmit(async (data) => {
    if (data) {
      closeModal()
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
    }
  })

  const clusterDeleteModeOptions = [
    {
      label: 'Default',
      value: ClusterDeleteMode.DEFAULT,
    },
    {
      label: 'Qovery config only',
      value: ClusterDeleteMode.DELETE_QOVERY_CONFIG,
    },
    {
      label: 'Cluster and Qovery config',
      value: ClusterDeleteMode.DELETE_CLUSTER_AND_QOVERY_CONFIG,
    },
  ]

  const clusterDeleteModeOptionsFormatted = match(cluster)
    .with(
      {
        kubernetes: 'SELF_MANAGED',
      },
      () =>
        clusterDeleteModeOptions.filter(
          (e) => !(e.value === 'DELETE_CLUSTER_AND_QOVERY_CONFIG' && cluster.kubernetes === 'SELF_MANAGED')
        )
    )
    .with({ cloud_provider: 'AWS' }, () =>
      clusterDeleteModeOptions.map((o) =>
        o.value === 'DELETE_CLUSTER_AND_QOVERY_CONFIG'
          ? {
              ...o,
              label: 'Cluster and Qovery config - Skip managed databases',
            }
          : o
      )
    )
    .otherwise(() => clusterDeleteModeOptions)

  match(clusterDeleteMode)
    .with('DEFAULT', () => 'Default')
    .with('DELETE_CLUSTER_AND_QOVERY_CONFIG', () => 'Cluster and Qovery config')
    .with('DELETE_QOVERY_CONFIG', () => 'Qovery Config only')
    .exhaustive()

  const navigate = useNavigate()

  const ctaButtonDisabled =
    (kubernetes === 'SELF_MANAGED' ? confirmKubernetesChecked !== true : confirmCloudProviderChecked !== true) ||
    confirmQoveryConfigChecked !== true ||
    // WARN: Cannot use react-hook-form isValid due to
    // https://github.com/react-hook-form/react-hook-form/issues/2755
    watch('name') !== 'delete'

  return (
    <div className="p-6">
      <h2 className="h4 mb-2 max-w-sm text-neutral-400">Confirm deletion cluster</h2>
      <div className="mb-6 text-sm text-neutral-350">
        To confirm the deletion of <strong>{name}</strong>, please type "delete"
      </div>
      <form onSubmit={onSubmit}>
        <Controller
          name="name"
          control={control}
          rules={{
            required: 'Please enter "delete".',
            validate: (value) => value === 'delete' || 'Please confirm by entering "delete".',
          }}
          defaultValue=""
          render={({ field, fieldState: { error } }) => (
            <InputTextSmall
              className="mb-5"
              placeholder='Enter "delete"'
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
            />
          )}
        />
        <div className="mb-6 rounded border border-red-500 bg-red-50 p-4 text-sm text-neutral-400">
          {cluster.kubernetes !== 'SELF_MANAGED' && (
            <InputSelect
              className="mb-3"
              label="Delete mode"
              options={clusterDeleteModeOptionsFormatted}
              onChange={(value) => setClusterDeleteMode(value as ClusterDeleteMode)}
              value={clusterDeleteMode}
            />
          )}
          <p className="font-medium">
            Use it carefully this action is irreversible. Please confirm that you are aware of the operation impact:
          </p>

          <div className="flex flex-col">
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
                <span className="font-medium">Qovery environments:</span> the configuration of this cluster and any
                linked environment will be deleted.
              </label>
            </div>
            {cluster.kubernetes === 'SELF_MANAGED' ? (
              <>
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
                    <span className="font-medium">Your Kubernetes cluster</span>:{' '}
                    {cluster.is_demo
                      ? 'nothing will be deleted on your cluster, you will have to manually delete it.'
                      : ' nothing will be deleted on your cluster. You will have to manually delete any deployed application and uninstall the Qovery helm chart from your cluster.'}
                  </label>
                </div>
                {cluster.is_demo && (
                  <Callout.Root className="mt-3" color="sky">
                    <Callout.Icon>
                      <Icon iconName="info-circle" iconStyle="regular" />
                    </Callout.Icon>
                    <Callout.Text>
                      <p>The best way to delete your cluster is via our CLI!</p>
                      <ul className="list-disc pl-3">
                        <li>You can delete your local demo cluster using the CLI command `qovery demo destroy`.</li>
                        <li>
                          If you want to destroy your local demo cluster and the configuration of the environment
                          deployed on it, use the CLI command `qovery demo destroy -d`
                        </li>
                      </ul>
                    </Callout.Text>
                  </Callout.Root>
                )}
              </>
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
          </div>
          {kubernetes !== 'SELF_MANAGED' && clusterDeleteMode !== ClusterDeleteMode.DELETE_QOVERY_CONFIG && (
            <Callout.Root className="mt-3" color="yellow">
              <Callout.Icon>
                <Icon iconName="triangle-exclamation" iconStyle="regular" />
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
        <div className="flex justify-end gap-3">
          <Button type="button" color="neutral" variant="plain" size="lg" onClick={() => closeModal()}>
            Cancel
          </Button>
          <Button type="submit" size="lg" color="red" disabled={ctaButtonDisabled}>
            Confirm
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ClusterDeleteModal
