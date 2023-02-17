import { DeploymentStageResponse, DeploymentStageServiceResponse } from 'qovery-typescript-axios'
import { DraggableLocation } from 'react-beautiful-dnd'

export const reorder = (
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

  // Add reorder on the clone stages array
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

  // Find the source stage
  const sourceStage = cloneStages.find((stage, index) => index === sourceDroppableId)

  if (sourceStage) {
    // Find the destination stage
    const destinationStage = cloneStages.find((stage, index) => index === destinationDroppableId)

    if (destinationStage?.services && sourceStage?.services) {
      // Remove the service from the source services
      const cloneSourceServices = [...sourceStage.services]
      // Get the service of the first source stage with the droppable source index
      const [serviceMoved] = cloneSourceServices.splice(droppableSource.index, 1)

      // Add the service on the destination services on the droppable destination index
      const cloneDestinationServices = [...destinationStage.services]
      cloneDestinationServices.splice(droppableDestination.index, 0, serviceMoved)

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

export function diffStagesById(currentStages: any, newStages: any) {
  const result = []

  for (const key in currentStages) {
    if (typeof currentStages[key] === 'object' && typeof newStages[key] === 'object') {
      const nestedDiff = diffStagesById(currentStages[key], newStages[key])
      if (Object.keys(nestedDiff).length > 0) {
        result.push({
          deployment_order: currentStages[key].deployment_order,
          services: currentStages[key].services?.map((service: DeploymentStageServiceResponse) => service.id),
        })
      }
    } else if (currentStages[key] !== newStages[key]) {
      // result[key].service = console.log(currentStages[key])
      result.push({
        deployment_order: currentStages[key].deployment_order,
        services: currentStages[key].services?.map((service: DeploymentStageServiceResponse) => service.id),
      })
    }
  }

  return result
}
