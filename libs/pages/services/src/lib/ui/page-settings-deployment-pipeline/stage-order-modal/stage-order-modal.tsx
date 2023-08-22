import { DeploymentStageResponse } from 'qovery-typescript-axios'
import { Dispatch, SetStateAction } from 'react'
import { DragDropContext, Draggable, DropResult, Droppable } from 'react-beautiful-dnd'
import { BadgeDeploymentOrder, Button, ButtonSize, ButtonStyle, ScrollShadowWrapper } from '@qovery/shared/ui'
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
    `flex items-center w-full text-zinc-400 text-ssm font-medium rounded p-4 border ${
      isDragging
        ? 'border-2 border-green-500 bg-zinc-50'
        : 'border-element-light-lighter-500 bg-element-light-lighter-200'
    }`

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="p-6">
        <h2 className="h4 text-zinc-400 max-w-sm truncate mb-1">Edit execution order</h2>
        <p className="mb-6 text-zinc-350 text-sm">You can drag and drop stages to modify their order.</p>
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
                        className="!top-[auto] !left-[auto] flex items-center mb-1"
                      >
                        <div
                          className={`text-center w-5 h-5 text-sm text-zinc-400 mr-3 ${
                            snapshot.isDragging ? 'opacity-0' : ''
                          }`}
                        >
                          {index}
                        </div>
                        <div className={snapshot && classNameItem(snapshot.isDragging)}>
                          <BadgeDeploymentOrder order={stage.deployment_order} />
                          <span className="block ml-1">{stage.name}</span>
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
        <div className="flex gap-3 justify-end mt-6">
          <Button
            dataTestId="cancel-button"
            className="btn--no-min-w"
            style={ButtonStyle.STROKED}
            size={ButtonSize.XLARGE}
            onClick={() => props.onClose()}
          >
            Cancel
          </Button>
        </div>
      </div>
    </DragDropContext>
  )
}

export default StageOrderModal
