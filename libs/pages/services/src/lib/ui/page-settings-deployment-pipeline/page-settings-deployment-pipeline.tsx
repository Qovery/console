import {
  type CloudProviderEnum,
  type DeploymentStageResponse,
  type DeploymentStageServiceResponse,
} from 'qovery-typescript-axios'
import { type Dispatch, Fragment, type SetStateAction, useMemo } from 'react'
import { DragDropContext, Draggable, type DropResult, Droppable } from 'react-beautiful-dnd'
import { useParams } from 'react-router-dom'
import { useDeleteDeploymentStage, useMoveDeploymentStage } from '@qovery/domains/environments/feature'
import { type AnyService } from '@qovery/domains/services/data-access'
import { ServiceAvatar } from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import {
  BadgeDeploymentOrder,
  Board,
  Button,
  type ColumnType,
  DropdownMenu,
  Icon,
  LoaderSpinner,
  Menu,
  MenuAlign,
  type MenuData,
  Section,
  Tooltip,
  Truncate,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { type StageRequest } from '../../feature/page-settings-deployment-pipeline-feature/page-settings-deployment-pipeline-feature'
import { StageModalFeature } from '../../feature/page-settings-deployment-pipeline-feature/stage-modal-feature/stage-modal-feature'
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

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const { environmentId = '' } = useParams()
  const { mutateAsync: moveDeploymentStageRequested } = useMoveDeploymentStage()
  const { mutate: deleteEnvironmentDeploymentStage } = useDeleteDeploymentStage({ environmentId })

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

  const boardData = useMemo(
    () =>
      stages?.map((stage) => {
        return {
          ...stage,
          columnId: stage.id,
          heading: (
            <div className="flex grow items-center">
              <BadgeDeploymentOrder order={stage.deployment_order} />
              <span className="block truncate text-2xs font-bold text-neutral-400">
                <Truncate truncateLimit={28} text={stage.name || ''} />
              </span>
              {stage.description && (
                <Tooltip content={stage.description}>
                  <div>
                    <Icon
                      iconName="circle-info"
                      iconStyle="regular"
                      className="relative -top-[2px] ml-1 text-xs text-neutral-350"
                    />
                  </div>
                </Tooltip>
              )}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <Button data-testid="btn-more-menu" color="neutral" variant="plain" className="ml-auto">
                    <Icon iconName="ellipsis" />
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Item
                    icon={<Icon iconName="pen" />}
                    onSelect={() =>
                      openModal({
                        content: <StageModalFeature onClose={closeModal} environmentId={environmentId} stage={stage} />,
                      })
                    }
                  >
                    Edit stage
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Item
                    color="red"
                    icon={<Icon iconName="trash" />}
                    onSelect={() =>
                      openModalConfirmation({
                        title: 'Delete this stage',
                        isDelete: true,
                        name: stage.name,
                        action: () => deleteEnvironmentDeploymentStage({ stageId: stage.id }),
                      })
                    }
                  >
                    Delete stage
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>
          ),
          items:
            stage.services?.map((s) => {
              const service = services?.find(({ id }) => id === s.service_id)
              const contentWithParams = service?.serviceType === 'DATABASE'
              return {
                ...s,
                content: (
                  <div className="flex flex-row items-center">
                    {service && <ServiceAvatar className="mr-2" service={service} size="sm" border="solid" />}
                    <div className={`font-medium text-neutral-400 ${contentWithParams ? 'text-xs' : 'text-ssm'}`}>
                      <Truncate truncateLimit={contentWithParams ? 32 : 27} text={service?.name || ''} />
                      {contentWithParams && (
                        <div data-testid="draggable-item-subtitle" className="text-2xs font-normal">
                          {upperCaseFirstLetter(service.type)} - {upperCaseFirstLetter(service.mode)}
                        </div>
                      )}
                    </div>
                  </div>
                ),
              }
            }) ?? [],
        } satisfies ColumnType
      }) ?? [],
    [services, stages]
  )

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
            Add stage <Icon iconName="circle-plus" iconStyle="regular" />
          </Button>
        </SettingsHeading>
        <div className="h-full overflow-x-auto">
          {!stages && !services ? (
            <div data-testid="stages-loader" className="flex max-w-4xl justify-center">
              <LoaderSpinner className="mt-5 w-4" />
            </div>
          ) : (
            <>
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
                                    iconName="circle-info"
                                    iconStyle="regular"
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
              <div className="flex pb-5">
                <Board
                  data={boardData}
                  setData={async ({ sourceColumnId, targetColumnId, sourceCardId, after = false, newData }) => {
                    if (!sourceCardId) {
                      // Move column
                      const result = await moveDeploymentStageRequested({
                        stageId: sourceColumnId,
                        targetStageId: targetColumnId,
                        after,
                      })
                      setStages(result)
                    } else {
                      // Move card
                      setStages(
                        newData.map((stage) => ({
                          ...stage,
                          // As Board component only work in ColumnType props,
                          // we must reconcile `items` and `services`
                          services: stage.items.map((item) => ({
                            ...item,
                          })),
                        }))
                      )

                      const serviceId = stages?.reduce<string | undefined>((serviceId, stage) => {
                        if (serviceId) {
                          return serviceId
                        }
                        return stage.services?.find(({ id }) => sourceCardId === id)?.service_id
                      }, undefined)

                      if (serviceId) {
                        // new stage for final request
                        const newStageRequest: StageRequest = {
                          stageId: targetColumnId,
                          serviceId,
                        }
                        // previous stage for final request if undo
                        const prevStageRequest: StageRequest = {
                          stageId: sourceColumnId,
                          serviceId,
                        }
                        // submit change
                        onSubmit(newStageRequest, prevStageRequest)
                      }
                    }
                  }}
                />
              </div>
            </>
          )}
        </div>
      </Section>
    </div>
  )
}

export default PageSettingsDeploymentPipeline
