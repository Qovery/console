import { DeploymentStageResponse, DeploymentStageServiceResponse } from 'qovery-typescript-axios'
import { Dispatch, SetStateAction } from 'react'
import { DragDropContext, Draggable, DropResult, Droppable } from 'react-beautiful-dnd'
import { ApplicationEntity, DatabaseEntity } from '@qovery/shared/interfaces'
import { HelpSection, LoaderSpinner, StickyActionFormToaster } from '@qovery/shared/ui'
import { StageRequest } from '../../feature/page-settings-deployment-pipeline-feature/page-settings-deployment-pipeline-feature'
import { move, reorder } from '../../feature/page-settings-deployment-pipeline-feature/utils/utils'

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
    <div className="w-[calc(100vw-373px)]">
      <div className="flex flex-col w-full h-[calc(100%-128px)] bg-element-light-lighter-200">
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
                  <>
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
                    <div key={index} className="w-60 shrink-0 rounded">
                      <div className="h-10 flex items-center bg-element-light-lighter-200 px-3 py-2 border border-element-light-lighter-500 rounded-t">
                        <div className="relative flex mr-2">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M0.75 7.4944V7.49434C0.749825 6.70932 0.956163 5.93795 1.34845 5.25727C1.74074 4.57661 2.30525 4.01043 2.98569 3.61534C2.98571 3.61533 2.98573 3.61532 2.98575 3.6153L7.73569 0.859176L7.73572 0.859157C8.42304 0.460203 9.20414 0.25 9.99947 0.25C10.7948 0.25 11.5759 0.460203 12.2632 0.859157L17.0132 3.6174L17.0132 3.61744C17.6933 4.01207 18.2577 4.57758 18.6501 5.25751C19.0426 5.93743 19.2494 6.70805 19.25 7.49249V12.5056V12.5057C19.2502 13.2907 19.0438 14.0621 18.6515 14.7427C18.2593 15.4234 17.6947 15.9896 17.0143 16.3847C17.0143 16.3847 17.0143 16.3847 17.0142 16.3847L12.2643 19.1408L12.2643 19.1408C11.577 19.5398 10.7959 19.75 10.0005 19.75C9.20521 19.75 8.42413 19.5398 7.73682 19.1409C7.73681 19.1409 7.73679 19.1409 7.73678 19.1408L2.98682 16.3826L2.98675 16.3826C2.30669 15.9879 1.74232 15.4224 1.34988 14.7425C0.957447 14.0626 0.750626 13.292 0.75 12.5075L0.75 12.5056V7.4944Z"
                              fill="#5B50D6"
                              stroke="url(#paint0_linear_12619_562346)"
                              stroke-width="0.5"
                            />
                            <defs>
                              <linearGradient
                                id="paint0_linear_12619_562346"
                                x1="10"
                                y1="0"
                                x2="10"
                                y2="20"
                                gradientUnits="userSpaceOnUse"
                              >
                                <stop stop-color="#7568FF" />
                                <stop offset="1" stop-color="#3B3491" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-text-100 text-xxs">
                            {stage.deployment_order}
                          </span>
                        </div>
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
                  </>
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
