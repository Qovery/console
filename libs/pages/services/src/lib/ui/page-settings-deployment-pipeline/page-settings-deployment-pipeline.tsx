import {
  type CloudProviderEnum,
  type DeploymentStageResponse,
  type DeploymentStageServiceResponse,
} from 'qovery-typescript-axios'
import { type Dispatch, Fragment, type SetStateAction } from 'react'
import { DragDropContext, Draggable, type DropResult, Droppable } from 'react-beautiful-dnd'
import { type AnyService } from '@qovery/domains/services/data-access'
import { SettingsHeading } from '@qovery/shared/console-shared'
import {
  BadgeDeploymentOrder,
  Button,
  Icon,
  IconAwesomeEnum,
  LoaderSpinner,
  Menu,
  MenuAlign,
  type MenuData,
  Section,
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
  services?: AnyService[]
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
        stageId: stages[destinationIndex].id,
        serviceId: draggableId,
      }

      // previous stage for final request if undo
      const prevStageRequest: StageRequest = {
        stageId: stages[sourceIndex].id,
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
      <Section className="flex w-full flex-col rounded-tr-sm p-8">
        <SettingsHeading
          title="Pipeline"
          description={
            <>
              Stages allow to define deployment order within the deployment pipeline of your environment. Default stages
              are available based on the service type, you can edit/remove them based on your need.
              <span className="mt-1 block text-2xs">
                <span role="img" aria-label="light">
                  💡
                </span>{' '}
                Tips: You can drag & drop
              </span>
            </>
          }
        >
          <Button
            data-testid="btn-add-stage"
            className="ml-5 shrink-0 gap-2"
            size="md"
            variant="solid"
            onClick={() => onAddStage()}
          >
            Add stage <Icon iconName="circle-plus" iconStyle="light" />
          </Button>
        </SettingsHeading>
        <div className="h-full overflow-x-auto">
          {!stages && !services ? (
            <div data-testid="stages-loader" className="flex max-w-4xl justify-center">
              <LoaderSpinner className="mt-5 w-4" />
            </div>
          ) : (
            <div className="flex pb-5">
              <DragDropContext onDragEnd={onDragEnd}>
                {stages?.map((stage, index) => (
                  <Fragment key={stage.id}>
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
                      <div className="flex h-11 items-center justify-between rounded-t border border-neutral-250 bg-neutral-100 px-3 py-2">
                        <div className="flex items-center">
                          <BadgeDeploymentOrder order={stage.deployment_order} />
                          <span className="block truncate text-2xs font-bold text-neutral-400">
                            <Truncate truncateLimit={28} text={stage.name || ''} />
                          </span>
                          {stage.description && (
                            <Tooltip content={stage.description}>
                              <div>
                                <Icon
                                  name={IconAwesomeEnum.CIRCLE_INFO}
                                  className="relative -top-[2px] ml-1 text-xs text-neutral-350"
                                />
                              </div>
                            </Tooltip>
                          )}
                        </div>
                        <Menu
                          key={JSON.stringify(stages)}
                          width={256}
                          trigger={
                            <Button data-testid="btn-more-menu" color="neutral" variant="plain">
                              <Icon iconName="ellipsis" />
                            </Button>
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
                                      />
                                    )
                                  }
                                  return <div />
                                }}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            {stage.services?.length === 0 && !snapshot.isDraggingOver && (
                              <div data-testid="placeholder-stage" className="px-3 py-6 text-center">
                                <Icon iconName="wave-pulse" className="text-neutral-350" />
                                <p className="mt-1 text-xs font-medium text-neutral-350">
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
      </Section>
    </div>
  )
}

export default PageSettingsDeploymentPipeline
