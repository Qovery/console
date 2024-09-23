import { Reorder } from 'framer-motion'
import { type DeploymentStageResponse } from 'qovery-typescript-axios'
import { useState } from 'react'
import { BadgeDeploymentOrder, Button, ScrollShadowWrapper } from '@qovery/shared/ui'
import { findMovedIndices } from '@qovery/shared/util-js'

export interface StageOrderModalProps {
  onClose: () => void
  onSubmit: (
    stageId: string,
    beforeOrAfterStageId: string,
    after: boolean
  ) => Promise<DeploymentStageResponse[] | undefined>
  currentStages?: DeploymentStageResponse[]
}

export function StageOrderModal({ currentStages = [], onClose, onSubmit }: StageOrderModalProps) {
  const [localStages, setLocalStages] = useState(currentStages)

  const handleDrop = async () => {
    const movedIndices = findMovedIndices(currentStages, localStages, (a, b) => a.id === b.id)
    if (!movedIndices) {
      return
    }
    const [sourceIndex, destinationIndex] = movedIndices
    const result = await onSubmit(
      currentStages[sourceIndex].id,
      currentStages[destinationIndex].id,
      sourceIndex < destinationIndex
    )
    if (result) {
      setLocalStages(result)
    }
  }

  return (
    <div className="p-6">
      <h2 className="h4 mb-1 max-w-sm truncate text-neutral-400">Edit execution order</h2>
      <p className="mb-6 text-sm text-neutral-350">You can drag and drop stages to modify their order.</p>
      <ScrollShadowWrapper className="max-h-[500px]">
        <Reorder.Group axis="y" values={localStages} onReorder={setLocalStages} className="flex flex-col gap-1">
          {localStages?.map((stage) => (
            <Reorder.Item
              key={stage.id}
              value={stage}
              initial={{ cursor: 'grab' }}
              exit={{ cursor: 'grab' }}
              whileDrag={{ cursor: 'grabbing', borderColor: '#44C979', borderWidth: '2px' }}
              onDragEnd={handleDrop}
              className="flex w-full items-center rounded border border-neutral-250 bg-neutral-100 p-4 text-ssm font-medium text-neutral-400"
            >
              <BadgeDeploymentOrder order={stage.deployment_order} />
              <span className="ml-1 block">{stage.name}</span>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </ScrollShadowWrapper>
      <div className="mt-6 flex justify-end gap-3">
        <Button data-testid="cancel-button" size="lg" color="neutral" variant="plain" onClick={() => onClose()}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

export default StageOrderModal
