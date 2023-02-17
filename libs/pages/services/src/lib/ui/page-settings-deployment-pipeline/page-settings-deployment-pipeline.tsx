import { DeploymentStageResponse, DeploymentStageServiceResponse } from 'qovery-typescript-axios'
import { Dispatch, SetStateAction } from 'react'
import { DragDropContext, Draggable, DropResult, Droppable } from 'react-beautiful-dnd'
import { HelpSection, StickyActionFormToaster } from '@qovery/shared/ui'
import { move, reorder } from '../../feature/page-settings-deployment-pipeline-feature/utils/utils'

export interface PageSettingsDeploymentPipelineProps {
  onSubmit: () => void
  onReset: () => void
  discardChanges: boolean
  loading: boolean
  setStages: Dispatch<SetStateAction<DeploymentStageResponse[] | undefined>>
  stages?: DeploymentStageResponse[]
}

export function PageSettingsDeploymentPipeline(props: PageSettingsDeploymentPipelineProps) {
  const { stages, setStages, onSubmit, onReset, discardChanges, loading } = props

  function onDragEnd(result: DropResult) {
    const { source, destination } = result

    if (!destination || !stages) {
      return
    }
    const sourceIndex = +source.droppableId
    const destinationIndex = +destination.droppableId

    if (sourceIndex === destinationIndex) {
      // reorder inside the group
      const newStages = reorder(stages, destinationIndex, source.index, destination.index)
      setStages(newStages)
    } else {
      // move to another group
      const newStages = move(stages, source, destination) as DeploymentStageResponse[]
      setStages(newStages)
    }
  }

  if (!stages) return <div>hello</div>

  const classNameGroup = (isDraggingOver: boolean) =>
    `grid gap-1 p-1 border border-element-light-lighter-500 border-t-0 rounded-b ${
      isDraggingOver ? 'bg-success-100' : 'bg-element-light-lighter-400'
    }`

  const classNameItem = (isDragging: boolean) =>
    `flex items-center drop-shadow-item-deployment-group bg-element-light-lighter-100 rounded px-2 py-3 border ${
      isDragging ? 'border-2 border-success-500' : 'border-element-light-lighter-400'
    }`

  return (
    <div className="w-full">
      <div className="flex flex-col justify-between w-full h-[calc(100%-128px)] p-5 bg-element-light-lighter-200">
        <div>
          <p className="text-xs text-text-500 mb-5">
            Stages allow to define deployment order within the deployment pipeline of your environment. You can drag &
            drop the service between two stages to change the order.
          </p>
          <div className="flex">
            <DragDropContext onDragEnd={onDragEnd}>
              {stages?.map((stage, index) => (
                <div key={index} className="w-60 rounded mr-3">
                  <div className="h-10 flex items-center bg-element-light-lighter-200 px-3 py-2 border border-element-light-lighter-500 rounded-t">
                    <span className="block mr-2 text-xxs">{stage.deployment_order}</span>
                    <span className="block text-text-500 text-xxs font-bold">{stage.name}</span>
                  </div>
                  <Droppable key={index} droppableId={`${index}`}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        className={classNameGroup(snapshot.isDraggingOver)}
                        {...provided.droppableProps}
                      >
                        {stage.services?.map((item: DeploymentStageServiceResponse, index: number) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{ ...provided.draggableProps.style }}
                                className={classNameItem(snapshot.isDragging)}
                              >
                                <span className="block text-text-500 text-ssm font-medium">{item.id}</span>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </DragDropContext>
          </div>
        </div>
        <StickyActionFormToaster visible={discardChanges} onSubmit={onSubmit} onReset={onReset} loading={loading} />
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/deployment/deployment-management/',
            linkLabel: 'How to configure my deployment group',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsDeploymentPipeline
