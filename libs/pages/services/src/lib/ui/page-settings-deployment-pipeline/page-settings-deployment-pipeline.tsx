import { DeploymentStageResponse, DeploymentStageServiceResponse } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { DragDropContext, Draggable, DraggableLocation, DropResult, Droppable } from 'react-beautiful-dnd'
import { HelpSection } from '@qovery/shared/ui'

export interface PageSettingsDeploymentPipelineProps {
  deploymentStage?: DeploymentStageResponse[]
}

// Define the shape of an item in the list
// interface Item {
//   id: string
//   content: string
// }

// fake data generator
// const getItems = (count: number, offset = 0): DeploymentStageResponse[] =>
//   Array.from({ length: count }, (v, k) => k).map((k) => ({
//     id: `item-${k + offset}-${new Date().getTime()}`,
//     content: `item ${k + offset}`,
//   }))

// const reorder = (list: DeploymentStageResponse[], startIndex: number, endIndex: number): DeploymentStageResponse[] => {
//   const result = Array.from(list)
//   const [removed] = result.splice(startIndex, 1)
//   result.splice(endIndex, 0, removed)

//   return result
// }

/**
 * Moves an item from one list to another list.
 */
const move = (
  stages: DeploymentStageResponse[],
  droppableSource: DraggableLocation,
  droppableDestination: DraggableLocation
) => {
  let result
  const cloneStages = [...stages]

  const sourceDroppableId = parseInt(droppableSource.droppableId, 10)
  const destinationDroppableId = parseInt(droppableDestination.droppableId, 10)

  // Find the source stage
  const sourceStage = cloneStages.find((obj, index) => index === sourceDroppableId)

  if (sourceStage) {
    // Get the service of the first source stage with the droppable source index
    const serviceMoved = sourceStage.services?.find((stage, index) => index === droppableSource.index)

    // Find the destination stage
    const destinationStage = cloneStages.find((stage, index) => index === droppableDestination.index)

    if (destinationStage?.services && sourceStage?.services && serviceMoved) {
      // Remove the service from the source services
      // console.log(sourceStage.services)
      const cloneSourceServices = sourceStage.services.splice(0, 0)

      // const a = [...['a', 'b', 'c']].splice(1, 1)
      // console.log(a)

      // console.log('droppableSource : ', droppableSource.index)
      // console.log('cloneSourceServices : ', cloneSourceServices)

      // Add the service on the destination services on the droppable destination index
      const cloneDestinationServices = [...destinationStage.services].splice(
        droppableDestination.index,
        0,
        serviceMoved
      )

      // console.log('cloneDestinationServices : ', [...destinationStage.services])

      // Add new services for source and destination on the stages
      result = cloneStages.map((stage, index) => {
        if (index === sourceDroppableId) {
          return { ...stage, services: cloneSourceServices }
        }
        if (index === destinationDroppableId) {
          return { ...stage, services: cloneDestinationServices }
        }
        return stage
      })
    }
  }

  return result
}

export function PageSettingsDeploymentPipeline(props: PageSettingsDeploymentPipelineProps) {
  const { deploymentStage } = props
  const [stages, setStages] = useState<DeploymentStageResponse[] | undefined>(deploymentStage)

  useEffect(() => {
    setStages(deploymentStage)
  }, [deploymentStage])

  function onDragEnd(result: DropResult) {
    const { source, destination } = result

    // dropped outside the list
    if (!destination || !stages) {
      return
    }
    const sourceIndex = +source.droppableId
    const destinationIndex = +destination.droppableId

    // const sourceStage = stages[sourceIndex]
    // const destinationStage = stages[destinationIndex]
    // console.log(sourceStage)
    // console.log(destinationStage)

    if (sourceIndex === destinationIndex) {
      //   const items = reorder(state[sInd], source.index, destination.index)
      //   const newState = [...state]
      //   newState[sInd] = items
      //   setStages(newState)
    } else {
      move(stages, source, destination)
      // const newStages: any = [...stages]
      // newStages[sourceIndex] = result[sourceIndex]
      // newStages[destinationIndex] = result[destinationIndex]

      // setStages(newStages.filter((group: any) => group.length))
    }
  }

  if (!stages) return <div>hello</div>

  const classNameGroup = (isDraggingOver: boolean) =>
    `grid gap-1 p-1 border border-element-light-lighter-500 border-t-0 rounded-b ${
      isDraggingOver ? 'bg-success-100' : 'bg-element-light-lighter-400'
    }`

  const classNameItem = (isDragging: boolean) =>
    `flex items-center bg-element-light-lighter-100 rounded px-2 py-3 ${isDragging} ? 'border-success-100' : 'border-element-light-lighter-400'`

  return (
    <div className="w-full">
      <div className="w-full h-[calc(100%-128px)] p-5 bg-element-light-lighter-200">
        <p className="text-xs text-text-500 mb-5">
          Stages allow to define deployment order within the deployment pipeline of your environment. You can drag &
          drop the service between two stages to change the order.
        </p>
        <div className="flex">
          <DragDropContext onDragEnd={onDragEnd}>
            {stages?.map((stage, index) => (
              <div className="w-60 rounded mr-3">
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
