import {
  type CloudProviderEnum,
  type DeploymentStageResponse,
  type DeploymentStageServiceResponse,
} from 'qovery-typescript-axios'
import { type Dispatch, Fragment, type SetStateAction } from 'react'
import { DragDropContext, Draggable, type DropResult, Droppable } from 'react-beautiful-dnd'
import { type ApplicationEntity, type DatabaseEntity } from '@qovery/shared/interfaces'
import {
  BadgeDeploymentOrder,
  ButtonIcon,
  ButtonIconStyle,
  ButtonLegacy,
  ButtonSize,
  HelpSection,
  Icon,
  IconAwesomeEnum,
  LoaderSpinner,
  Menu,
  MenuAlign,
  type MenuData,
  Tooltip,
  Truncate,
} from '@qovery/shared/ui'
import { type StageRequest } from '../../feature/page-settings-deployment-pipeline-feature/page-settings-deployment-pipeline-feature'
import { move, reorderService } from '../../feature/page-settings-deployment-pipeline-feature/utils/utils'
import DraggableItem from './draggable-item/draggable-item'

export interface PageSettingsDeploymentPipelineProps {
  onSubmit: (newStage: StageRequest, prevStage: StageRequest) => void
  setStages: Dispatch<SetStateAction<DeploymentStageResponse[] | undefined>>
  menuStage: (stage: DeploymentStageResponse, stages?: DeploymentStageResponse[]) => MenuData
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
      // reorder service inside the group
      const newStages = reorderService(stages, destinationIndex, source.index, destination.index)
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
    `grid gap-1 p-1 border border-neutral-250 border-t-0 rounded-b ${
      isDraggingOver ? 'bg-green-100' : 'bg-neutral-200'
    }`

  return (
    <div className="w-[calc(100vw-368px)]">
      <div className="flex flex-col w-full h-[calc(100%-128px)] bg-neutral-100 rounded-tr-sm">
        <div className="flex justify-between items-center px-5 my-5">
          <p className="text-xs text-neutral-400">
            Stages allow to define deployment order within the deployment pipeline of your environment. Default stages
            are available based on the service type, you can edit/remove them based on your need.
            <span className="block text-2xs mt-1">
              <span role="img" aria-label="light">
                💡
              </span>{' '}
              Tips: You can drag & drop
            </span>
          </p>
          <ButtonLegacy
            dataTestId="btn-add-stage"
            className="shrink-0 ml-5"
            onClick={() => onAddStage()}
            iconRight={IconAwesomeEnum.CIRCLE_PLUS}
          >
            Add stage
          </ButtonLegacy>
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
                      <div className="h-11 flex justify-between items-center bg-neutral-100 px-3 py-2 border border-neutral-250 rounded-t">
                        <div className="flex items-center">
                          <BadgeDeploymentOrder order={stage.deployment_order} />
                          <span className="block truncate text-neutral-400 text-2xs font-bold">
                            <Truncate truncateLimit={28} text={stage.name || ''} />
                          </span>
                          {stage.description && (
                            <Tooltip content={stage.description}>
                              <div>
                                <Icon
                                  name={IconAwesomeEnum.CIRCLE_INFO}
                                  className="text-neutral-350 text-xs ml-1 relative -top-[2px]"
                                />
                              </div>
                            </Tooltip>
                          )}
                        </div>
                        <Menu
                          width={256}
                          trigger={
                            <ButtonIcon
                              className="text-neutral-400 !px-1 !w-7"
                              style={ButtonIconStyle.FLAT}
                              icon={IconAwesomeEnum.ELLIPSIS}
                              size={ButtonSize.TINY}
                            />
                          }
                          menus={menuStage(stage, stages)}
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
                            {stage.services?.length === 0 && !snapshot.isDraggingOver && (
                              <div data-testid="placeholder-stage" className="text-center px-3 py-6">
                                <Icon name={IconAwesomeEnum.WAVE_PULSE} className="text-neutral-350" />
                                <p className="text-neutral-350 font-medium text-xs mt-1">
                                  No service for this stage. <br /> Please drag and drop a service.
                                </p>
                              </div>
                            )}
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
