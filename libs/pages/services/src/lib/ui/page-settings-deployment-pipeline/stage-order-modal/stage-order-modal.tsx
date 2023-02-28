import { DeploymentStageResponse } from 'qovery-typescript-axios'
import { FormEventHandler, useState } from 'react'
import { DragDropContext, Draggable, DropResult, Droppable } from 'react-beautiful-dnd'
import { ModalCrud } from '@qovery/shared/ui'
import { reorder } from '../../../feature/page-settings-deployment-pipeline-feature/utils/utils'
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

    const sourceIndex = +source.droppableId
    const destinationIndex = +destination.droppableId || 0

    if (sourceIndex === destinationIndex && currentStages) {
      const newStages = reorder(currentStages, destinationIndex, source.index, destination.index)
      setCurrentStages(newStages)
    }
  }

  const classNameItem = (isDragging: boolean) =>
    `flex items-center w-full bg-element-light-lighter-200 text-text-500 text-ssm font-medium rounded px-2 py-3 border ${
      isDragging ? 'border-2 border-success-500' : 'border-element-light-lighter-500'
    }`

  return (
    <ModalCrud
      title="Edit execution order"
      loading={props.loading}
      onSubmit={props.onSubmit}
      onClose={props.onClose}
      isEdit
    >
      <div style={{ overflow: 'auto', maxHeight: '600px' }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div className="select-none" {...provided.droppableProps} ref={provided.innerRef}>
                {currentStages?.map((stage, index) => (
                  <Draggable key={stage.id} draggableId={stage.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={snapshot && classNameItem(snapshot.isDragging)}
                      >
                        <BadgeDeploymentOrder deploymentOrder={stage.deployment_order} />
                        <span className="block ml-1">{stage.name}</span>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="1">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {props.stages?.map((stage, index) => (
                <div className="flex items-center mb-1 last:mb-0">
                  <span>{index}</span>
                  <Draggable key={stage.id} draggableId={stage.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={snapshot && classNameItem(snapshot.isDragging)}
                      >
                        <BadgeDeploymentOrder deploymentOrder={stage.deployment_order} />
                        <span className="block ml-1">{stage.name}</span>
                      </div>
                    )}
                  </Draggable>
                </div>
              ))}
            </div>
          )}
        </Droppable>
      </DragDropContext> */}
    </ModalCrud>
  )
}

export default StageOrderModal
