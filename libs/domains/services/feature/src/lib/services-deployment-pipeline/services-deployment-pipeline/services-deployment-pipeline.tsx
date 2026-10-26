import { useParams } from '@tanstack/react-router'
import clsx from 'clsx'
import { type DeploymentStageResponse } from 'qovery-typescript-axios'
import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from 'react'
import { toast as toastAction } from 'sonner'
import { match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import { IconEnum } from '@qovery/shared/enums'
import {
  Avatar,
  Badge,
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
import { useAttachServiceToDeploymentStage } from '../../hooks/use-attach-service-to-deployment-stage/use-attach-service-to-deployment-stage'
import { useDeleteDeploymentStage } from '../../hooks/use-delete-deployment-stage/use-delete-deployment-stage'
import { useListDeploymentStages } from '../../hooks/use-list-deployment-stages/use-list-deployment-stages'
import { useServices } from '../../hooks/use-services/use-services'
import { ServicesDeploymentStageModal } from '../services-deployment-stage-modal/services-deployment-stage-modal'
import { ServicesDeploymentStageOrderModal } from '../services-deployment-stage-order-modal/services-deployment-stage-order-modal'

type StageServiceCard = NonNullable<DeploymentStageResponse['services']>[number] & BoardCard

interface StageRequest {
  stageId: string
  serviceId: string
  isSkipped?: boolean
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
    .with({ serviceType: 'ARGOCD_APP' }, () => IconEnum.ARGOCD)
    .with({ serviceType: 'AGENTIC_WORKFLOW' }, () => IconEnum.AGENTIC_WORKFLOW)
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

export function ServicesDeploymentPipeline() {
  const { environmentId = '' } = useParams({ strict: false })
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  const { data: services, isLoading: isServicesLoading } = useServices({ environmentId })
  const { data: deploymentStages, isLoading: isDeploymentStagesLoading } = useListDeploymentStages({ environmentId })
  const { mutate: attachServiceToDeploymentStage, isLoading: isUpdatingStage } = useAttachServiceToDeploymentStage()
  const { mutate: deleteDeploymentStage } = useDeleteDeploymentStage({ environmentId })

  const [stages, setStages] = useState<DeploymentStageResponse[] | undefined>()

  useEffect(() => {
    setStages(deploymentStages)
  }, [deploymentStages])

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
    toastAction.dismiss()

    if (newStage.stageId === prevStage.stageId) {
      return
    }

    attachServiceToDeploymentStage(
      { ...newStage, prevStage },
      {
        onError: () => setStages(deploymentStages),
      }
    )
  }

  const isLoading = isServicesLoading || isDeploymentStagesLoading || !stages || !services

  return (
    <Section className="relative flex w-full flex-col bg-surface-neutral p-4 pb-0">
      <div
        className="pointer-events-none absolute inset-2"
        style={{
          backgroundImage: `radial-gradient(circle at center, var(--neutral-3) 0.125rem, transparent 0.125rem)`,
          backgroundSize: '1.5rem 1.5rem',
        }}
      />
      <div className="relative flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Heading>Pipeline</Heading>
            <p className="text-ssm text-neutral-subtle">
              Stages allow to define deployment order within the deployment pipeline of your environment. <br />
              Drag and drop services between stages. Skipped services are excluded from environment-level deployments.
            </p>
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            color="neutral"
            onClick={() =>
              openModal({
                content: <ServicesDeploymentStageModal environmentId={environmentId} onClose={closeModal} />,
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

        <div className="relative -ml-4 w-[calc(100%+2rem)] overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <LoaderSpinner />
            </div>
          ) : (
            <Board.Root className="gap-4 pb-4">
              {stages.map((stage, index) => {
                const { id: stageId, deployment_order, name, description, services: stageServices } = stage
                const showArrow = index < stages.length - 1
                const attachedServices = deploymentStages?.find(({ id }) => id === stageId)?.services ?? []
                const hasAttachedServices = attachedServices.length > 0 || (stageServices?.length ?? 0) > 0

                return (
                  <div className="relative shrink-0 first:ml-4 last:mr-4" key={stageId}>
                    {showArrow && (
                      <svg
                        className="absolute left-full top-0"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="19"
                        height="56"
                        fill="none"
                        viewBox="0 0 19 56"
                      >
                        <path fill="var(--neutral-6)" d="M0 27h19v1H0z"></path>
                      </svg>
                    )}

                    <Board.Column
                      columnId={stageId}
                      data={cards}
                      shouldHighlightIndicator={false}
                      setData={({ sourceColumnId, sourceCardId, targetColumnId, newData }) => {
                        if (isUpdatingStage) {
                          return
                        }
                        updateLocalStages(newData, setStages)

                        const movedService = stages
                          ?.flatMap((currentStage) => currentStage.services ?? [])
                          .find((service) => service.id === sourceCardId)

                        const serviceId = movedService?.service_id

                        if (!serviceId || !sourceCardId) {
                          return
                        }

                        onSubmit(
                          {
                            stageId: targetColumnId,
                            serviceId,
                            isSkipped: movedService.is_skipped ?? false,
                          },
                          {
                            stageId: sourceColumnId,
                            serviceId,
                            isSkipped: movedService.is_skipped ?? false,
                          }
                        )
                      }}
                      heading={
                        <div className="flex grow items-center gap-2">
                          <BadgeDeploymentOrder order={deployment_order} />
                          <span className="flex items-center gap-1 truncate text-xs text-neutral">
                            <Truncate truncateLimit={18} text={name || ''} />
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
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                              <Button
                                type="button"
                                color="neutral"
                                variant="outline"
                                size="xs"
                                className="ml-auto justify-center"
                                aria-label={`Stage actions for ${name}`}
                                iconOnly
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
                                      <ServicesDeploymentStageModal
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
                                    content: <ServicesDeploymentStageOrderModal onClose={closeModal} stages={stages} />,
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
                              <Tooltip
                                content="Move all services, including skipped services, to another stage before deleting this stage"
                                disabled={!hasAttachedServices}
                              >
                                <DropdownMenu.Item
                                  color={hasAttachedServices ? 'neutral' : 'red'}
                                  aria-disabled={hasAttachedServices}
                                  className={
                                    hasAttachedServices
                                      ? 'cursor-not-allowed text-neutral-disabled hover:bg-transparent hover:text-neutral-disabled data-[highlighted]:bg-transparent data-[highlighted]:text-neutral-disabled [&>i]:text-neutral-disabled'
                                      : undefined
                                  }
                                  icon={<Icon iconName="trash" />}
                                  onSelect={(event) => {
                                    if (hasAttachedServices) {
                                      event.preventDefault()
                                      return
                                    }
                                    openModalConfirmation({
                                      title: 'Delete this stage',
                                      confirmationMethod: 'action',
                                      name,
                                      action: () => {
                                        deleteDeploymentStage({ stageId })
                                      },
                                    })
                                  }}
                                >
                                  Delete stage
                                </DropdownMenu.Item>
                              </Tooltip>
                            </DropdownMenu.Content>
                          </DropdownMenu.Root>
                        </div>
                      }
                    >
                      {!stageServices || stageServices.length === 0 ? (
                        <div className="mt-2.5 flex flex-col items-center gap-2 rounded border border-neutral bg-surface-neutral p-3 text-center">
                          <Icon iconName="wave-pulse" className="text-neutral-subtle" />
                          <p className="text-xs text-neutral-subtle">
                            No service for this stage. <br /> Please drag and drop a service.
                          </p>
                        </div>
                      ) : (
                        cards
                          .filter(({ columnId }) => columnId === stage.id)
                          .map(({ cardId, service_id, is_skipped }) => {
                            if (!service_id) {
                              return null
                            }

                            const service = servicesById.get(service_id)
                            const subtitle = getDatabaseSubtitle(service)

                            return (
                              <Board.Card key={cardId} cardId={cardId} columnId={stage.id}>
                                <div className="flex items-center gap-2">
                                  {service && (
                                    <Avatar
                                      className="h-5 w-6 shrink-0"
                                      size="custom"
                                      fallback={<Icon name={getServiceIconName(service)} height="100%" width="100%" />}
                                    />
                                  )}
                                  <div
                                    className={clsx(
                                      'min-w-0 flex-1 font-medium text-neutral',
                                      is_skipped && 'text-neutral-subtle',
                                      subtitle ? 'text-xs' : 'text-ssm'
                                    )}
                                  >
                                    <Truncate truncateLimit={subtitle ? 32 : 27} text={service?.name || ''} />
                                    {subtitle && <div className="text-2xs font-normal">{subtitle}</div>}
                                    {is_skipped && (
                                      <Badge size="sm" className="mt-1 gap-1">
                                        <Icon iconName="ban" iconStyle="regular" />
                                        Skipped
                                      </Badge>
                                    )}
                                  </div>
                                  <DropdownMenu.Root>
                                    <DropdownMenu.Trigger asChild>
                                      <Button
                                        type="button"
                                        color="neutral"
                                        variant="plain"
                                        size="xs"
                                        iconOnly
                                        aria-label={`Deployment options for ${service?.name || service_id}`}
                                        disabled={isUpdatingStage}
                                      >
                                        <Icon iconName="ellipsis" />
                                      </Button>
                                    </DropdownMenu.Trigger>
                                    <DropdownMenu.Content>
                                      <DropdownMenu.Item
                                        icon={<Icon iconName={is_skipped ? 'play' : 'ban'} />}
                                        onSelect={() =>
                                          attachServiceToDeploymentStage({
                                            stageId,
                                            serviceId: service_id,
                                            isSkipped: !is_skipped,
                                            prevStage: {
                                              stageId,
                                              serviceId: service_id,
                                              isSkipped: is_skipped ?? false,
                                            },
                                          })
                                        }
                                      >
                                        {is_skipped ? 'Include in deployments' : 'Skip in deployments'}
                                      </DropdownMenu.Item>
                                    </DropdownMenu.Content>
                                  </DropdownMenu.Root>
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

export default ServicesDeploymentPipeline
