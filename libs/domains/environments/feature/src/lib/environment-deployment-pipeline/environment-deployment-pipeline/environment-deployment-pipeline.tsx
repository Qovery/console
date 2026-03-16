import { useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import clsx from 'clsx'
import { type DeploymentStageResponse } from 'qovery-typescript-axios'
import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from 'react'
import { toast as toastAction } from 'react-hot-toast'
import { match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import { IconEnum } from '@qovery/shared/enums'
import {
  Avatar,
  BadgeDeploymentOrder,
  Board,
  type BoardCard,
  Button,
  DropdownMenu,
  Heading,
  Icon,
  LoaderSpinner,
  Section,
  Tooltip,
  Truncate,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { queries } from '@qovery/state/util-queries'
import { useAttachServiceToDeploymentStage } from '../../hooks/use-attach-service-to-deployment-stage/use-attach-service-to-deployment-stage'
import { useDeleteDeploymentStage } from '../../hooks/use-delete-deployment-stage/use-delete-deployment-stage'
import { useListDeploymentStages } from '../../hooks/use-list-deployment-stages/use-list-deployment-stages'
import { EnvironmentDeploymentStageModal } from '../environment-deployment-stage-modal/environment-deployment-stage-modal'
import { EnvironmentDeploymentStageOrderModal } from '../environment-deployment-stage-order-modal/environment-deployment-stage-order-modal'

export const SKIPPED_STAGE_ID = '__VIRTUAL_SKIPPED__'

const VIRTUAL_SKIPPED_STAGE: DeploymentStageResponse = {
  id: SKIPPED_STAGE_ID,
  created_at: '',
  environment: { id: '' },
  name: 'Skipped',
  description: 'Services excluded from environment-level deployments',
  deployment_order: -1,
  services: [],
}

type StageServiceCard = NonNullable<DeploymentStageResponse['services']>[number] & BoardCard

interface StageRequest {
  stageId: string
  serviceId: string
  isSkipped?: boolean
}

function getProcessedStages(deploymentStages?: DeploymentStageResponse[]) {
  if (!deploymentStages || deploymentStages.length === 0) {
    return []
  }

  const regularStages = deploymentStages.map((stage) => ({
    ...stage,
    services: stage.services?.filter((service) => !service.is_skipped) ?? [],
  }))

  const skippedServices = deploymentStages.flatMap(
    (stage) => stage.services?.filter((service) => service.is_skipped) ?? []
  )

  return [
    {
      ...VIRTUAL_SKIPPED_STAGE,
      environment: deploymentStages[0]?.environment ?? VIRTUAL_SKIPPED_STAGE.environment,
      services: skippedServices,
    },
    ...regularStages,
  ]
}

function getDatabaseSubtitle(service?: AnyService) {
  return match(service)
    .with(
      { serviceType: 'DATABASE' },
      ({ type, mode }) => `${upperCaseFirstLetter(type)} - ${upperCaseFirstLetter(mode)}`
    )
    .otherwise(() => undefined)
}

function getServiceIconName(service: AnyService) {
  return match(service)
    .with({ serviceType: 'APPLICATION' }, { serviceType: 'CONTAINER' }, () => IconEnum.APPLICATION)
    .with({ serviceType: 'DATABASE' }, () => IconEnum.DATABASE)
    .with({ serviceType: 'HELM' }, () => IconEnum.HELM)
    .with({ serviceType: 'JOB', job_type: 'LIFECYCLE' }, () => IconEnum.LIFECYCLE_JOB)
    .with({ serviceType: 'JOB' }, () => IconEnum.CRON_JOB)
    .with({ serviceType: 'TERRAFORM' }, () => IconEnum.TERRAFORM)
    .exhaustive()
}

function updateLocalStages(
  newData: StageServiceCard[],
  setStages: Dispatch<SetStateAction<DeploymentStageResponse[] | undefined>>
) {
  setStages((currentStages) =>
    currentStages?.map((stage) => ({
      ...stage,
      services: newData.filter(({ columnId }) => columnId === stage.id),
    }))
  )
}

export function EnvironmentDeploymentPipeline() {
  const { environmentId = '' } = useParams({ strict: false })
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  const { data: services, isLoading: isServicesLoading } = useQuery({
    ...queries.services.list(environmentId),
    enabled: Boolean(environmentId),
    select(services) {
      services.sort(({ name: nameA }, { name: nameB }) => nameA.localeCompare(nameB))
      return services
    },
  })
  const { data: deploymentStages, isLoading: isDeploymentStagesLoading } = useListDeploymentStages({ environmentId })
  const { mutate: attachServiceToDeploymentStage } = useAttachServiceToDeploymentStage()
  const { mutate: deleteDeploymentStage } = useDeleteDeploymentStage({ environmentId })

  const [stages, setStages] = useState<DeploymentStageResponse[] | undefined>()

  const processedStages = useMemo(() => getProcessedStages(deploymentStages), [deploymentStages])

  useEffect(() => {
    setStages(processedStages)
  }, [processedStages])

  const cards = useMemo(
    () =>
      (stages?.flatMap(
        ({ id: stageId, services: stageServices }) =>
          stageServices?.map((service) => ({
            ...service,
            columnId: stageId,
            cardId: service.id,
          })) ?? []
      ) ?? []) satisfies StageServiceCard[],
    [stages]
  )

  const servicesById = useMemo(() => new Map((services ?? []).map((service) => [service.id, service])), [services])

  const onSubmit = (newStage: StageRequest, prevStage: StageRequest) => {
    toastAction.remove()

    if (newStage.stageId === prevStage.stageId) {
      return
    }

    if (newStage.stageId === SKIPPED_STAGE_ID) {
      attachServiceToDeploymentStage({
        stageId: prevStage.stageId,
        serviceId: newStage.serviceId,
        isSkipped: true,
        prevStage,
      })
      return
    }

    attachServiceToDeploymentStage({
      stageId: newStage.stageId,
      serviceId: newStage.serviceId,
      isSkipped: false,
      prevStage,
    })
  }

  const isLoading = isServicesLoading || isDeploymentStagesLoading || !stages || !services

  return (
    <Section className="flex w-full flex-col p-8 pb-0">
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Heading>Pipeline</Heading>
            <p className="text-ssm text-neutral-subtle">
              Stages allow to define deployment order within the deployment pipeline of your environment. <br />
              Tips: You can drag & drop services to change their order.
            </p>
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            color="neutral"
            className="gap-1.5"
            onClick={() =>
              openModal({
                content: <EnvironmentDeploymentStageModal environmentId={environmentId} onClose={closeModal} />,
                options: {
                  width: 488,
                },
              })
            }
          >
            <Icon iconName="circle-plus" iconStyle="regular" />
            Add stage
          </Button>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <LoaderSpinner />
            </div>
          ) : (
            <Board.Root className="gap-4 pb-4">
              {stages.map((stage, index) => {
                const { id: stageId, deployment_order, name, description, services: stageServices } = stage
                const isVirtualSkippedStage = stageId === SKIPPED_STAGE_ID
                const showArrow = index < stages.length - 1 && !isVirtualSkippedStage

                return (
                  <div className="relative shrink-0" key={stageId}>
                    {showArrow && (
                      <svg
                        aria-hidden="true"
                        className="absolute left-full top-5 text-neutral-subtle"
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="43"
                        fill="none"
                        viewBox="0 0 16 43"
                      >
                        <path fill="currentColor" d="M16 21.5 8.5 17.17v8.66L16 21.5Zm-16 .75h9.25v-1.5H0v1.5Z" />
                      </svg>
                    )}

                    <Board.Column
                      columnId={stageId}
                      data={cards}
                      shouldHighlightIndicator={false}
                      setData={({ sourceColumnId, sourceCardId, targetColumnId, newData }) => {
                        updateLocalStages(newData, setStages)

                        const serviceId = stages
                          ?.flatMap((currentStage) => currentStage.services ?? [])
                          .find((service) => service.id === sourceCardId)?.service_id

                        if (!serviceId || !sourceCardId) {
                          return
                        }

                        onSubmit(
                          {
                            stageId: targetColumnId,
                            serviceId,
                          },
                          {
                            stageId: sourceColumnId,
                            serviceId,
                          }
                        )
                      }}
                      heading={
                        <div className="flex grow items-center gap-1.5">
                          {!isVirtualSkippedStage && <BadgeDeploymentOrder order={deployment_order} />}
                          <span className="flex items-center gap-1.5 text-sm font-bold text-neutral">
                            {isVirtualSkippedStage && (
                              <Icon iconName="ban" iconStyle="regular" className="text-neutral-subtle" />
                            )}
                            <Truncate truncateLimit={28} text={upperCaseFirstLetter(name) || ''} />
                            {description && (
                              <Tooltip content={description}>
                                <span>
                                  <Icon
                                    iconName="circle-info"
                                    iconStyle="regular"
                                    className="cursor-default text-xs text-neutral-subtle"
                                  />
                                </span>
                              </Tooltip>
                            )}
                          </span>
                          {!isVirtualSkippedStage && (
                            <DropdownMenu.Root>
                              <DropdownMenu.Trigger asChild>
                                <Button
                                  type="button"
                                  color="neutral"
                                  variant="plain"
                                  className="ml-auto h-8 w-8 justify-center px-0"
                                  aria-label={`Stage actions for ${name}`}
                                >
                                  <Icon iconName="ellipsis" />
                                </Button>
                              </DropdownMenu.Trigger>
                              <DropdownMenu.Content>
                                <DropdownMenu.Item
                                  icon={<Icon iconName="pen" />}
                                  onSelect={() =>
                                    openModal({
                                      content: (
                                        <EnvironmentDeploymentStageModal
                                          environmentId={environmentId}
                                          onClose={closeModal}
                                          stage={stage}
                                        />
                                      ),
                                      options: {
                                        width: 488,
                                        fakeModal: true,
                                      },
                                    })
                                  }
                                >
                                  Edit stage
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                  icon={<Icon iconName="arrow-down-1-9" />}
                                  onSelect={() =>
                                    openModal({
                                      content: (
                                        <EnvironmentDeploymentStageOrderModal
                                          onClose={closeModal}
                                          stages={stages.filter(({ id }) => id !== SKIPPED_STAGE_ID)}
                                        />
                                      ),
                                      options: {
                                        width: 488,
                                        fakeModal: true,
                                      },
                                    })
                                  }
                                >
                                  Edit order
                                </DropdownMenu.Item>
                                <DropdownMenu.Separator />
                                <DropdownMenu.Item
                                  color="red"
                                  icon={<Icon iconName="trash" />}
                                  onSelect={() =>
                                    openModalConfirmation({
                                      title: 'Delete this stage',
                                      confirmationMethod: 'action',
                                      name,
                                      action: () => {
                                        deleteDeploymentStage({ stageId })
                                      },
                                    })
                                  }
                                >
                                  Delete stage
                                </DropdownMenu.Item>
                              </DropdownMenu.Content>
                            </DropdownMenu.Root>
                          )}
                        </div>
                      }
                    >
                      {!stageServices || stageServices.length === 0 ? (
                        <div className="px-3 py-6 text-center">
                          <Icon
                            iconName={isVirtualSkippedStage ? 'ban' : 'wave-pulse'}
                            className="text-neutral-subtle"
                          />
                          <p className="mt-2 text-xs font-medium leading-5 text-neutral-subtle">
                            {isVirtualSkippedStage ? (
                              <>
                                Skipped services are excluded from environment-level deployments. <br /> Drag services
                                here to skip them.
                              </>
                            ) : (
                              <>
                                No service for this stage. <br /> Please drag and drop a service.
                              </>
                            )}
                          </p>
                        </div>
                      ) : (
                        cards
                          .filter(({ columnId }) => columnId === stage.id)
                          .map(({ cardId, service_id }) => {
                            if (!service_id) {
                              return null
                            }

                            const service = servicesById.get(service_id)
                            const subtitle = getDatabaseSubtitle(service)

                            return (
                              <Board.Card key={cardId} cardId={cardId} columnId={stage.id}>
                                <div
                                  className={clsx('flex flex-row items-center', isVirtualSkippedStage && 'opacity-60')}
                                >
                                  {service && (
                                    <Avatar
                                      className="mr-2"
                                      size="sm"
                                      border="solid"
                                      fallback={<Icon name={getServiceIconName(service)} height="100%" width="100%" />}
                                    />
                                  )}
                                  <div
                                    className={clsx(
                                      'font-medium text-neutral',
                                      isVirtualSkippedStage && 'text-neutral-subtle',
                                      subtitle ? 'text-xs' : 'text-ssm'
                                    )}
                                  >
                                    <Truncate truncateLimit={subtitle ? 32 : 27} text={service?.name || ''} />
                                    {subtitle && <div className="text-2xs font-normal">{subtitle}</div>}
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
          )}
        </div>
      </div>
    </Section>
  )
}

export default EnvironmentDeploymentPipeline
