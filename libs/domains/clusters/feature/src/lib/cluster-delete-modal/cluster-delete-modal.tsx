import { useState } from 'react'
import { BannerBox, BannerBoxEnum, IconAwesomeEnum, InputSelect, ModalConfirmation } from '@qovery/shared/ui'
import useDeleteCluster from '../hooks/use-delete-cluster/use-delete-cluster'

export interface ClusterDeleteModalProps {
  organizationId: string
  clusterId: string
}

export function ClusterDeleteModal({ organizationId, clusterId }: ClusterDeleteModalProps) {
  const { mutateAsync } = useDeleteCluster()
  const [deleteMode, setDeleteMode] = useState('')

  return (
    <ModalConfirmation
      title="Confirm deletion cluster"
      callback={async () => {
        console.log(deleteMode)
        await mutateAsync({
          organizationId,
          clusterId,
        })
      }}
      content={
        <div className="border border-red-500 rounded bg-red-50 text-sm text-neutral-400 p-4 mb-6">
          <InputSelect
            className="mb-3"
            label="Delete mode"
            options={[
              {
                label: 'test',
                value: 'test',
              },
            ]}
            onChange={(value) => setDeleteMode(value as string)}
            value={deleteMode}
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
          <p className="mb-3">Use it carefully this action is irreversible.</p>
          <BannerBox
            type={BannerBoxEnum.WARNING}
            message={
              <>
                <p>Please note that you will have to manually delete on your cloud account:</p>
                <ul className="list-disc pl-3">
                  <li>the S3 bucket named xxxxxx-xxxxxx-xxxxxx</li>
                  <li>the image registry linked to this cluster</li>
                  <li>
                    any resource created by a lifecycle job that will not be properly deleted during the `environment
                    deletion` event.
                  </li>
                </ul>
              </>
            }
            icon={IconAwesomeEnum.TRIANGLE_EXCLAMATION}
          />
        </div>
      }
      isDelete
    />
  )
}

export default ClusterDeleteModal
