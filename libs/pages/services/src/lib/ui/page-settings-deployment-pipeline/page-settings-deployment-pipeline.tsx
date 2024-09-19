import { type DeploymentStageResponse } from 'qovery-typescript-axios'
import { type Dispatch, type SetStateAction, useMemo } from 'react'
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
  Section,
  Tooltip,
  Truncate,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { type StageRequest } from '../../feature/page-settings-deployment-pipeline-feature/page-settings-deployment-pipeline-feature'
import { StageModalFeature } from '../../feature/page-settings-deployment-pipeline-feature/stage-modal-feature/stage-modal-feature'

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
  const { mutateAsync: moveDeploymentStageRequested } = useMoveDeploymentStage()
  const { mutate: deleteEnvironmentDeploymentStage } = useDeleteDeploymentStage({ environmentId })

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
                      className="relative -top-[2px] ml-1 cursor-default text-xs text-neutral-350"
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
                    data-testid="menuItem"
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
                    data-testid="menuItem"
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
      }),
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
        {!boardData ? (
          <div data-testid="stages-loader" className="flex max-w-4xl justify-center">
            <LoaderSpinner className="mt-5 w-4" />
          </div>
        ) : (
          <div className="flex pb-5">
            <Board
              emptyState={
                <div className="px-3 py-6 text-center" data-testid="placeholder-stage">
                  <Icon iconName="wave-pulse" className="text-neutral-350" />
                  <p className="mt-1 text-xs font-medium text-neutral-350">
                    No service for this stage. <br /> Please drag and drop a service.
                  </p>
                </div>
              }
              showCardIndicator={false}
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
                }
              }}
            />
          </div>
        )}
      </Section>
    </div>
  )
}

export default PageSettingsDeploymentPipeline
