import { type DeploymentStageResponse } from 'qovery-typescript-axios'
import { type Dispatch, type SetStateAction, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useDeleteDeploymentStage } from '@qovery/domains/environments/feature'
import { type AnyService } from '@qovery/domains/services/data-access'
import { ServiceAvatar } from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import {
  BadgeDeploymentOrder,
  Board,
  type BoardCard,
  Button,
  DropdownMenu,
  Icon,
  LoaderSpinner,
  Section,
  Tooltip,
  Truncate,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { type StageRequest } from '../../feature/page-settings-deployment-pipeline-feature/page-settings-deployment-pipeline-feature'
import { StageModalFeature } from '../../feature/page-settings-deployment-pipeline-feature/stage-modal-feature/stage-modal-feature'
import { StageOrderModalFeature } from '../../feature/page-settings-deployment-pipeline-feature/stage-order-modal-feature/stage-order-modal-feature'

export interface PageSettingsDeploymentPipelineProps {
  onSubmit: (newStage: StageRequest, prevStage: StageRequest) => void
  setStages: Dispatch<SetStateAction<DeploymentStageResponse[] | undefined>>
  onAddStage: () => void
  stages?: DeploymentStageResponse[]
  services?: AnyService[]
}

export function PageSettingsDeploymentPipeline(props: PageSettingsDeploymentPipelineProps) {
  const { stages, setStages, onSubmit, services, onAddStage } = props

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const { environmentId = '' } = useParams()
  const { mutate: deleteEnvironmentDeploymentStage } = useDeleteDeploymentStage({ environmentId })

  const cards = useMemo(
    () =>
      (stages?.flatMap(
        ({ id: stageId, services: stageServices }) =>
          stageServices?.map((s) => ({
            ...s,
            columnId: stageId,
            cardId: s.id,
          })) ?? []
      ) ?? []) satisfies BoardCard[],
    [stages]
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
          {!cards || cards.length === 0 || !services || services.length === 0 || !stages || stages.length === 0 ? (
            <div data-testid="stages-loader" className="flex max-w-4xl justify-center">
              <LoaderSpinner className="mt-5 w-4" />
            </div>
          ) : (
            <div className="flex pb-5">
              <Board.Root>
                {stages?.map((stage, index) => {
                  const { id: stageId, deployment_order, name, description, services: stageServices } = stage
                  const isLast = index !== stages.length - 1
                  return (
                    <div className="relative mr-4" key={stageId}>
                      {isLast && (
                        <svg
                          data-testid={`arrow-${stageId}`}
                          className="absolute left-full shrink-0"
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="43"
                          fill="none"
                          viewBox="0 0 16 43"
                        >
                          <path fill="#C6D3E7" d="M16 21.5l-7.5-4.33v8.66L16 21.5zm-16 .75h9.25v-1.5H0v1.5z"></path>
                        </svg>
                      )}
                      <Board.Column
                        data={cards}
                        setData={({ sourceColumnId, targetColumnId, sourceCardId, newData }) => {
                          setStages((stages) =>
                            stages?.map((stage) => ({
                              ...stage,
                              services: newData.filter(({ columnId }) => columnId === stage.id),
                            }))
                          )

                          const serviceId = stages
                            ?.flatMap((stage) => stage.services ?? [])
                            .find((service) => service.id === sourceCardId)?.service_id

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
                        }}
                        columnId={stageId}
                        shouldHighlightIndicator={false}
                        heading={
                          <div className="flex grow items-center">
                            <BadgeDeploymentOrder order={deployment_order} />
                            <span className="flex items-center gap-1.5 text-sm font-bold text-neutral-400">
                              <Truncate truncateLimit={28} text={upperCaseFirstLetter(name) || ''} />
                              {description && (
                                <Tooltip content={description}>
                                  <span>
                                    <Icon
                                      iconName="circle-info"
                                      iconStyle="regular"
                                      className="cursor-default text-xs text-neutral-350"
                                    />
                                  </span>
                                </Tooltip>
                              )}
                            </span>
                            <DropdownMenu.Root>
                              <DropdownMenu.Trigger asChild>
                                <Button data-testid="btn-more-menu" color="neutral" variant="plain" className="ml-auto">
                                  <Icon iconName="ellipsis" />
                                </Button>
                              </DropdownMenu.Trigger>
                              <DropdownMenu.Content>
                                <DropdownMenu.Item
                                  data-testid="menuItem"
                                  icon={<Icon iconName="pen" />}
                                  onSelect={() =>
                                    openModal({
                                      content: (
                                        <StageModalFeature
                                          onClose={closeModal}
                                          environmentId={environmentId}
                                          stage={stage}
                                        />
                                      ),
                                    })
                                  }
                                >
                                  Edit stage
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                  data-testid="menuItem"
                                  icon={<Icon iconName="arrow-down-1-9" />}
                                  onSelect={() =>
                                    openModal({
                                      content: <StageOrderModalFeature onClose={closeModal} stages={stages} />,
                                    })
                                  }
                                >
                                  Edit order
                                </DropdownMenu.Item>
                                <DropdownMenu.Separator />
                                <DropdownMenu.Item
                                  data-testid="menuItem"
                                  color="red"
                                  icon={<Icon iconName="trash" />}
                                  onSelect={() =>
                                    openModalConfirmation({
                                      title: 'Delete this stage',
                                      isDelete: true,
                                      name,
                                      action: () => deleteEnvironmentDeploymentStage({ stageId: stageId }),
                                    })
                                  }
                                >
                                  Delete stage
                                </DropdownMenu.Item>
                              </DropdownMenu.Content>
                            </DropdownMenu.Root>
                          </div>
                        }
                      >
                        {!stageServices || stageServices.length === 0 ? (
                          <div className="px-3 py-6 text-center" data-testid="placeholder-stage">
                            <Icon iconName="wave-pulse" className="text-neutral-350" />
                            <p className="mt-1 text-xs font-medium text-neutral-350">
                              No service for this stage. <br /> Please drag and drop a service.
                            </p>
                          </div>
                        ) : (
                          cards
                            .filter(({ columnId }) => columnId === stage.id)
                            .map(({ id, service_id }) => {
                              const service = services?.find(({ id: serviceId }) => serviceId === service_id)
                              const contentWithParams = service?.serviceType === 'DATABASE'
                              return (
                                <Board.Card key={id} cardId={id} columnId={stage.id}>
                                  <div className="flex flex-row items-center">
                                    {service && (
                                      <ServiceAvatar className="mr-2" service={service} size="sm" border="solid" />
                                    )}
                                    <div
                                      className={`font-medium text-neutral-400 ${contentWithParams ? 'text-xs' : 'text-ssm'}`}
                                    >
                                      <Truncate
                                        truncateLimit={contentWithParams ? 32 : 27}
                                        text={service?.name || ''}
                                      />
                                      {contentWithParams && (
                                        <div data-testid="draggable-item-subtitle" className="text-2xs font-normal">
                                          {upperCaseFirstLetter(service.type)} - {upperCaseFirstLetter(service.mode)}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </Board.Card>
                              )
                            })
                        )}
                      </Board.Column>
                    </div>
                  )
                })}
              </Board.Root>
            </div>
          )}
        </div>
      </Section>
    </div>
  )
}

export default PageSettingsDeploymentPipeline
