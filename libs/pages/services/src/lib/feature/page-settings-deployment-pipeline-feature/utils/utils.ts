import { type DeploymentStageResponse, type DeploymentStageServiceResponse } from 'qovery-typescript-axios'
import { type DraggableLocation } from 'react-beautiful-dnd'

export const reorderService = (
  stages: DeploymentStageResponse[],
  destinationIndex: number,
  startIndex: number,
  endIndex: number
): DeploymentStageResponse[] => {
  const cloneStages = [...stages]
  const currentStage = cloneStages[destinationIndex]
  const currentStageServices = [...(currentStage.services as DeploymentStageServiceResponse[])]

  const [removed] = currentStageServices.splice(startIndex, 1)
  currentStageServices.splice(endIndex, 0, removed)

  // add reorder on the clone stages array
  const result = cloneStages.map((stage, index) => {
    if (index === destinationIndex) {
      return { ...stage, services: currentStageServices }
    }
    return stage
  })

  return result
}

export const move = (
  stages: DeploymentStageResponse[],
  droppableSource: DraggableLocation,
  droppableDestination: DraggableLocation
): DeploymentStageResponse[] | undefined => {
  let result
  const cloneStages = [...stages]

  const sourceDroppableId = parseInt(droppableSource.droppableId, 10)
  const destinationDroppableId = parseInt(droppableDestination.droppableId, 10)

  // find the source stage
  const sourceStage = cloneStages.find((stage, index) => index === sourceDroppableId)

  if (sourceStage) {
    // find the destination stage
    const destinationStage = cloneStages.find((stage, index) => index === destinationDroppableId)

    if (destinationStage?.services && sourceStage?.services) {
      const cloneSourceServices = [...sourceStage.services]
      // remove the service from the source services
      const [serviceMoved] = cloneSourceServices.splice(droppableSource.index, 1)

      // add the service on the destination services on the droppable destination index
      const cloneDestinationServices = [...destinationStage.services]
      cloneDestinationServices.splice(droppableDestination.index, 0, serviceMoved)

      // add new services for source and destination on the stages
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
