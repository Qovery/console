import { CloudProviderEnum, DeploymentStageResponse, DeploymentStageServiceResponse } from 'qovery-typescript-axios'
import { Dispatch, Fragment, SetStateAction } from 'react'
import { DragDropContext, Draggable, DropResult, Droppable } from 'react-beautiful-dnd'
import { ApplicationEntity, DatabaseEntity } from '@qovery/shared/interfaces'
import {
  Button,
  ButtonIcon,
  ButtonIconStyle,
  ButtonSize,
  HelpSection,
  IconAwesomeEnum,
  LoaderSpinner,
  Menu,
  MenuAlign,
  MenuData,
  Truncate,
} from '@qovery/shared/ui'
import { StageRequest } from '../../feature/page-settings-deployment-pipeline-feature/page-settings-deployment-pipeline-feature'
import { move, reorder } from '../../feature/page-settings-deployment-pipeline-feature/utils/utils'
import BadgeDeploymentOrder from './badge-deployment-order/badge-deployment-order'
import DraggableItem from './draggable-item/draggable-item'

export interface PageSettingsDeploymentPipelineProps {
  onSubmit: (newStage: StageRequest, prevStage: StageRequest) => void
  setStages: Dispatch<SetStateAction<DeploymentStageResponse[] | undefined>>
  menuStage: (stage: DeploymentStageResponse) => MenuData
  onAddStage: () => void
  stages?: DeploymentStageResponse[]
  services?: (DatabaseEntity | ApplicationEntity)[]
  cloudProvider?: CloudProviderEnum
}

export function PageSettingsDeploymentPipeline(props: PageSettingsDeploymentPipelineProps) {
  const { stages, setStages, onSubmit, services, cloudProvider, onAddStage, menuStage } = props

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

      // new stage for final request
      const newStageRequest: StageRequest = {
        deploymentStageId: stages[destinationIndex].id,
        serviceId: draggableId,
      }

      // previous stage for final request if undo
      const prevStageRequest: StageRequest = {
        deploymentStageId: stages[sourceIndex].id,
        serviceId: draggableId,
      }

      // submit change
      onSubmit(newStageRequest, prevStageRequest)
    }
  }

  const classNameGroup = (isDraggingOver: boolean) =>
    `grid gap-1 p-1 border border-element-light-lighter-500 border-t-0 rounded-b ${
      isDraggingOver ? 'bg-success-100' : 'bg-element-light-lighter-400'
    }`

  return (
    <div className="w-[calc(100vw-368px)]">
      <div className="flex flex-col w-full h-[calc(100%-128px)] bg-element-light-lighter-200 rounded-tr-sm">
        <div className="flex justify-between items-center px-5 my-5">
          <p className="text-xs text-text-500">
            Stages allow to define deployment order within the deployment pipeline of your environment. You can drag &
            drop the service between two stages to change the order.
            <span className="block text-2xs mt-1">
              <span role="img" aria-label="light">
                💡
              </span>{' '}
              Tips: You can drag & drop
            </span>
          </p>
          <Button className="shrink-0 ml-5" onClick={() => onAddStage()} iconRight={IconAwesomeEnum.CIRCLE_PLUS}>
            Add stage
          </Button>
        </div>
        <div className="h-full overflow-x-scroll">
          {!stages ? (
            <div data-testid="stages-loader" className="flex justify-center max-w-4xl">
              <LoaderSpinner className="w-4 mt-5" />
            </div>
          ) : (
            <div className="flex px-5 pb-5">
              <DragDropContext onDragEnd={onDragEnd}>
                {stages?.map((stage, index) => (
                  <Fragment key={index}>
                    {index !== 0 && (
                      <svg
                        data-testid={`arrow-${index}`}
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
                      <div className="h-11 flex justify-between items-center bg-element-light-lighter-200 px-3 py-2 border border-element-light-lighter-500 rounded-t">
                        <div className="flex items-center">
                          <BadgeDeploymentOrder deploymentOrder={stage.deployment_order} />
                          <span className="block text-text-500 text-2xs font-bold">
                            <Truncate truncateLimit={28} text={stage.name || ''} />
                          </span>
                        </div>
                        <Menu
                          trigger={
                            <ButtonIcon
                              className="text-text-500"
                              style={ButtonIconStyle.FLAT}
                              onClick={() => console.log('hello')}
                              icon={IconAwesomeEnum.ELLIPSIS}
                              size={ButtonSize.TINY}
                            />
                          }
                          menus={menuStage(stage)}
                          arrowAlign={MenuAlign.END}
                        />
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
                                {(provided, snapshot) => {
                                  if (services && cloudProvider) {
                                    return (
                                      <DraggableItem
                                        serviceId={item.service_id || ''}
                                        provided={provided}
                                        snapshot={snapshot}
                                        services={services}
                                        cloudProvider={cloudProvider}
                                      />
                                    )
                                  }
                                  return <div />
                                }}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                    {index === stages.length - 1 && <div className="block w-5 shrink-0"></div>}
                  </Fragment>
                ))}
              </DragDropContext>
            </div>
          )}
        </div>
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/deployment/deployment-pipeline/',
            linkLabel: 'How to configure my deployment group',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsDeploymentPipeline
