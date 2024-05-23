import { type DeploymentStageResponse } from 'qovery-typescript-axios'
import { type Dispatch, type SetStateAction } from 'react'
import { DragDropContext, Draggable, type DropResult, Droppable } from 'react-beautiful-dnd'
import { BadgeDeploymentOrder, Button, ScrollShadowWrapper } from '@qovery/shared/ui'
import { reorderStage } from '../../../feature/page-settings-deployment-pipeline-feature/utils/utils'

export interface StageOrderModalProps {
  onClose: () => void
  onSubmit: (stageId: string, beforeOrAfterStageId: string, after: boolean) => void
  setCurrentStages: Dispatch<SetStateAction<DeploymentStageResponse[] | undefined>>
  currentStages?: DeploymentStageResponse[]
}

export function StageOrderModal(props: StageOrderModalProps) {
  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result

    if (!destination) {
      return
    }

    if (props.currentStages && source.index !== destination.index) {
      // reorder locally without waiting the api response
      const newStages = reorderStage(props.currentStages, source.index, destination.index)
      props.setCurrentStages(newStages)
      // submit the reorder for the api
      props.onSubmit(
        props.currentStages[source.index].id,
        props.currentStages[destination.index].id,
        source.index < destination.index
      )
    }
  }

  const classNameItem = (isDragging: boolean) =>
    `flex items-center w-full text-neutral-400 text-ssm font-medium rounded p-4 border ${
      isDragging ? 'border-2 border-green-500 bg-neutral-50' : 'border-neutral-250 bg-neutral-100'
    }`

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="p-6">
        <h2 className="h4 mb-1 max-w-sm truncate text-neutral-400">Edit execution order</h2>
        <p className="mb-6 text-sm text-neutral-350">You can drag and drop stages to modify their order.</p>
        <ScrollShadowWrapper className="max-h-[500px]">
          <Droppable droppableId="0">
            {(provided) => (
              <div className="select-none" {...provided.droppableProps} ref={provided.innerRef}>
                {props.currentStages?.map((stage, index) => (
                  <Draggable key={stage.id} draggableId={stage.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="!left-[auto] !top-[auto] mb-1 flex items-center"
                      >
                        <div
                          className={`mr-3 h-5 w-5 text-center text-sm text-neutral-400 ${
                            snapshot.isDragging ? 'opacity-0' : ''
                          }`}
                        >
                          {index}
                        </div>
                        <div className={snapshot && classNameItem(snapshot.isDragging)}>
                          <BadgeDeploymentOrder order={stage.deployment_order} />
                          <span className="ml-1 block">{stage.name}</span>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </ScrollShadowWrapper>
        <div className="mt-6 flex justify-end gap-3">
          <Button data-testid="cancel-button" size="lg" color="neutral" variant="plain" onClick={() => props.onClose()}>
            Cancel
          </Button>
        </div>
      </div>
    </DragDropContext>
  )
}

export default StageOrderModal
