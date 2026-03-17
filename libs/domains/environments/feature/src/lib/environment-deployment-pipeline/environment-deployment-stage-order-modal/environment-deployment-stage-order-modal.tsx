import clsx from 'clsx'
import { Reorder } from 'framer-motion'
import { type DeploymentStageResponse } from 'qovery-typescript-axios'
import { useState } from 'react'
import { BadgeDeploymentOrder, Button, Heading, ScrollShadowWrapper, Section } from '@qovery/shared/ui'
import { findMovedIndices } from '@qovery/shared/util-js'
import { useMoveDeploymentStage } from '../../hooks/use-move-deployment-stage/use-move-deployment-stage'

export interface EnvironmentDeploymentStageOrderModalProps {
  onClose: () => void
  stages: DeploymentStageResponse[]
}

export function EnvironmentDeploymentStageOrderModal({ onClose, stages }: EnvironmentDeploymentStageOrderModalProps) {
  const [currentStages, setCurrentStages] = useState(stages)
  const [localStages, setLocalStages] = useState(stages)
  const { mutateAsync: moveDeploymentStage } = useMoveDeploymentStage()

  const handleDrop = async () => {
    const movedIndices = findMovedIndices(currentStages, localStages, (left, right) => left.id === right.id)

    if (!movedIndices) {
      return
    }

    const [sourceIndex, destinationIndex] = movedIndices
    const result = await moveDeploymentStage({
      stageId: currentStages[sourceIndex].id,
      targetStageId: currentStages[destinationIndex].id,
      after: sourceIndex < destinationIndex,
    })

    if (!result) {
      return
    }

    setCurrentStages(result)
    setLocalStages(result)
  }

  return (
    <Section className="p-6">
      <div className="mb-6 flex flex-col gap-1">
        <Heading>Edit execution order</Heading>
        <p className="text-sm text-neutral-subtle">You can drag and drop stages to modify their order.</p>
      </div>

      <ScrollShadowWrapper className="max-h-[500px]">
        <Reorder.Group axis="y" values={localStages} onReorder={setLocalStages} className="flex flex-col gap-1">
          {localStages.map((stage) => (
            <Reorder.Item
              key={stage.id}
              value={stage}
              whileDrag={{ scale: 1.01 }}
              onDragEnd={handleDrop}
              className={clsx(
                'flex w-full items-center rounded-lg border border-neutral bg-surface-neutral-subtle p-4',
                'cursor-grab text-ssm font-medium text-neutral active:cursor-grabbing'
              )}
            >
              <BadgeDeploymentOrder order={stage.deployment_order} />
              <span className="ml-1 block">{stage.name}</span>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </ScrollShadowWrapper>

      <div className="mt-6 flex justify-end gap-3">
        <Button size="lg" color="neutral" variant="plain" type="button" onClick={() => onClose()}>
          Cancel
        </Button>
      </div>
    </Section>
  )
}

export default EnvironmentDeploymentStageOrderModal
