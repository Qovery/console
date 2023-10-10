import { ClusterDeleteMode } from 'qovery-typescript-axios'
import { useState } from 'react'
import { BannerBox, BannerBoxEnum, IconAwesomeEnum, InputSelect, ModalConfirmation } from '@qovery/shared/ui'
import useDeleteCluster from '../hooks/use-delete-cluster/use-delete-cluster'

export interface ClusterDeleteModalProps {
  organizationId: string
  clusterId: string
}

export function ClusterDeleteModal({ organizationId, clusterId }: ClusterDeleteModalProps) {
  const { mutateAsync } = useDeleteCluster()
  const [clusterDeleteMode, setClusterDeleteMode] = useState<ClusterDeleteMode>(ClusterDeleteMode.DEFAULT)

  const formattedClusterDeleteMode = (clusterDeleteMode: string) =>
    clusterDeleteMode
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')

  return (
    <ModalConfirmation
      title="Confirm deletion cluster"
      callback={async () => {
        await mutateAsync({
          organizationId,
          clusterId,
          clusterDeleteMode,
        })
      }}
      content={
        <div className="border border-red-500 rounded bg-red-50 text-sm text-neutral-400 p-4 mb-6">
          <InputSelect
            className="mb-3"
            label="Delete mode"
            options={Object.values(ClusterDeleteMode).map((mode) => ({
              label: formattedClusterDeleteMode(mode),
              value: mode,
            }))}
            onChange={(value) => setClusterDeleteMode(value as ClusterDeleteMode)}
            value={clusterDeleteMode}
          />
          <p>This operation will delete:</p>
          <ul className="list-disc pl-4">
            <li>
              <b>Cloud provider</b>: any resource created by Qovery on your cloud provider account to run this cluster
              will be deleted, including any environment attached to it.{' '}
            </li>
            <li>
              <b>Qovery organization</b>: the configuration of this cluster and any linked environment. Use it carefully
              this action is irreversible.
            </li>
          </ul>
          <p>Use it carefully this action is irreversible.</p>
          {clusterDeleteMode !== ClusterDeleteMode.DELETE_QOVERY_CONFIG && (
            <BannerBox
              className="mt-3"
              type={BannerBoxEnum.WARNING}
              message={
                <>
                  <p>Please note that you will have to manually delete on your cloud account:</p>
                  <ul className="list-disc pl-3">
                    <li>the S3 bucket named xxxxxx-xxxxxx-xxxxxx</li>
                    <li>the image registry linked to this cluster</li>
                    {clusterDeleteMode === ClusterDeleteMode.DELETE_CLUSTER_AND_QOVERY_CONFIG && (
                      <li>any managed database that was created via Qovery.</li>
                    )}
                    <li>
                      any resource created by a lifecycle job that will not be properly deleted during the `environment
                      deletion` event.
                    </li>
                  </ul>
                </>
              }
              icon={IconAwesomeEnum.TRIANGLE_EXCLAMATION}
            />
          )}
        </div>
      }
      isDelete
    />
  )
}

export default ClusterDeleteModal
