import { DeploymentStageResponse } from 'qovery-typescript-axios'
import { FormEventHandler } from 'react'
import { DragDropContext, Draggable, DropResult, Droppable } from 'react-beautiful-dnd'
import { ModalCrud } from '@qovery/shared/ui'

export interface StageOrderModalProps {
  onClose: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  stages?: DeploymentStageResponse[]
  loading?: boolean
}

export function StageOrderModal(props: StageOrderModalProps) {
  const onDragEnd = (result: DropResult) => {
    console.log(result)
  }

  return (
    <ModalCrud
      title="Edit execution order"
      loading={props.loading}
      onSubmit={props.onSubmit}
      onClose={props.onClose}
      isEdit
    >
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="0">
          {(provided, snapshot) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {props.stages?.map((stage, index) => (
                <Draggable key={stage.id} draggableId={stage.id} index={index}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      {stage.name}
                    </div>
                  )}
                </Draggable>
              ))}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </ModalCrud>
  )
}

export default StageOrderModal
