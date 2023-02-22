import { DeploymentStageResponse, DeploymentStageServiceResponse } from 'qovery-typescript-axios'
import { Dispatch, Fragment, SetStateAction } from 'react'
import { DragDropContext, Draggable, DropResult, Droppable } from 'react-beautiful-dnd'
import { ApplicationEntity, DatabaseEntity } from '@qovery/shared/interfaces'
import { HelpSection, LoaderSpinner, StickyActionFormToaster } from '@qovery/shared/ui'
import { StageRequest } from '../../feature/page-settings-deployment-pipeline-feature/page-settings-deployment-pipeline-feature'
import { move, reorder } from '../../feature/page-settings-deployment-pipeline-feature/utils/utils'
import BadgeDeploymentOrder from './badge-deployment-order/badge-deployment-order'

export interface PageSettingsDeploymentPipelineProps {
  onSubmit: () => void
  onReset: () => void
  discardChanges: boolean
  loading: boolean
  setStages: Dispatch<SetStateAction<DeploymentStageResponse[] | undefined>>
  setStagesRequest: Dispatch<SetStateAction<StageRequest[] | undefined>>
  stages?: DeploymentStageResponse[]
  stagesRequest?: StageRequest[]
  services?: (DatabaseEntity | ApplicationEntity)[]
}

export function PageSettingsDeploymentPipeline(props: PageSettingsDeploymentPipelineProps) {
  const { stages, setStages, setStagesRequest, onSubmit, onReset, discardChanges, loading, services } = props

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result

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

      // add stage for final request
      const newStageRequest: StageRequest = {
        deploymentStageId: stages[destinationIndex].id,
        serviceId: draggableId,
      }

      setStagesRequest((prev) => {
        if (prev) {
          // remove current value if already exist
          return [...prev.filter((current) => current.serviceId !== newStageRequest.serviceId), newStageRequest]
        } else {
          return [newStageRequest]
        }
      })
    }
  }

  const getParametersByServiceId = (serviceId?: string): DatabaseEntity | ApplicationEntity | undefined => {
    if (serviceId) return services?.filter((service) => service.id === serviceId)[0]
    return undefined
  }

  const classNameGroup = (isDraggingOver: boolean) =>
    `grid gap-1 p-1 border border-element-light-lighter-500 border-t-0 rounded-b ${
      isDraggingOver ? 'bg-success-100' : 'bg-element-light-lighter-400'
    }`

  const classNameItem = (isDragging: boolean) =>
    `flex items-center drop-shadow-item-deployment-group bg-element-light-lighter-100 rounded px-2 py-3 border ${
      isDragging ? 'border-2 border-success-500' : 'border-element-light-lighter-400'
    }`

  return (
    <div className="w-[calc(100vw-368px)]">
      <div className="flex flex-col w-full h-[calc(100%-128px)] bg-element-light-lighter-200 rounded-tr-sm">
        <div className="px-5 pt-5">
          <p className="text-xs text-text-500 mb-5">
            Stages allow to define deployment order within the deployment pipeline of your environment. You can drag &
            drop the service between two stages to change the order.
          </p>
        </div>
        <div className="h-full overflow-x-scroll">
          {!stages ? (
            <div className="flex justify-center max-w-4xl">
              <LoaderSpinner className="w-4 mt-5" />
            </div>
          ) : (
            <div className="flex px-5 pb-5">
              <DragDropContext onDragEnd={onDragEnd}>
                {stages?.map((stage, index) => (
                  <Fragment key={index}>
                    {index !== 0 && (
                      <svg
                        className="shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="43"
                        fill="none"
                        viewBox="0 0 16 43"
                      >
                        <path fill="#C6D3E7" d="M16 21.5l-7.5-4.33v8.66L16 21.5zm-16 .75h9.25v-1.5H0v1.5z"></path>
                      </svg>
                    )}
                    <div className="w-60 shrink-0 rounded">
                      <div className="h-10 flex items-center bg-element-light-lighter-200 px-3 py-2 border border-element-light-lighter-500 rounded-t">
                        <BadgeDeploymentOrder deploymentOrder={stage.deployment_order} />
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
                              <Draggable key={item.service_id} draggableId={item.service_id || ''} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{ ...provided.draggableProps.style }}
                                    className={classNameItem(snapshot.isDragging)}
                                  >
                                    <span className="block text-text-500 text-ssm font-medium">
                                      {getParametersByServiceId(item.service_id)?.name}
                                    </span>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                    {index === stages.length - 1 && <div className="block w-4 shrink-0"></div>}
                  </Fragment>
                ))}
              </DragDropContext>
            </div>
          )}
        </div>
        {stages && (
          <StickyActionFormToaster
            className="mb-5"
            visible={discardChanges}
            onSubmit={onSubmit}
            onReset={onReset}
            loading={loading}
          />
        )}
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
