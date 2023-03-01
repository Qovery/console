import { DeploymentStageResponse } from 'qovery-typescript-axios'
import { FormEventHandler, useState } from 'react'
import { DragDropContext, Draggable, DropResult, Droppable } from 'react-beautiful-dnd'
import { ModalCrud } from '@qovery/shared/ui'
import { reorderStage } from '../../../feature/page-settings-deployment-pipeline-feature/utils/utils'
import BadgeDeploymentOrder from '../badge-deployment-order/badge-deployment-order'

export interface StageOrderModalProps {
  onClose: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  stages?: DeploymentStageResponse[]
  loading?: boolean
}

export function StageOrderModal(props: StageOrderModalProps) {
  const [currentStages, setCurrentStages] = useState(props.stages)

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result

    if (!destination) {
      return
    }

    if (currentStages) {
      const newStages = reorderStage(currentStages, source.index, destination.index)
      setCurrentStages(newStages)
    }
  }

  const classNameItem = (isDragging: boolean) =>
    `flex items-center w-full bg-element-light-lighter-200 text-text-500 text-ssm font-medium rounded px-2 py-3 border ${
      isDragging ? 'border-2 border-success-500' : 'border-element-light-lighter-500'
    }`

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <ModalCrud
        title="Edit execution order"
        description="You can drag and drop stages to modify their order."
        onClose={props.onClose}
        loading={props.loading}
        isEdit
      >
        <div style={{ overflow: 'auto', maxHeight: '600px' }}>
          <Droppable droppableId="0">
            {(provided, snapshot) => (
              <div className="select-none" {...provided.droppableProps} ref={provided.innerRef}>
                {currentStages?.map((stage, index) => (
                  <Draggable key={stage.id} draggableId={stage.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="!top-[auto] !left-[auto] flex items-center mb-1 last:mb-0"
                      >
                        <div
                          className={`text-center w-5 h-5 text-sm text-text-500 mr-4 ${
                            snapshot.isDragging ? 'opacity-0' : ''
                          }`}
                        >
                          {index}
                        </div>
                        <div className={snapshot && classNameItem(snapshot.isDragging)}>
                          <BadgeDeploymentOrder deploymentOrder={stage.deployment_order} />
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
        </div>
      </ModalCrud>
    </DragDropContext>
  )
}

export default StageOrderModal
