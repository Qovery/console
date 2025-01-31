import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import {
  type DeploymentHistoryEnvironmentV2,
  type DeploymentHistoryStage,
  type Environment,
  type QueuedDeploymentRequestWithStages,
  type QueuedDeploymentRequestWithStagesStagesInner,
} from 'qovery-typescript-axios'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { P, match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import { ServiceAvatar } from '@qovery/domains/services/feature'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL, ENVIRONMENT_STAGES_URL } from '@qovery/shared/routes'
import { Indicator, StageStatusChip, StatusChip, Tooltip, TriggerActionIcon, Truncate } from '@qovery/shared/ui'
import { dateUTCString, formatDuration, formatDurationMinutesSeconds } from '@qovery/shared/util-dates'
import { twMerge, upperCaseFirstLetter } from '@qovery/shared/util-js'
import { isDeploymentHistory } from '../environment-deployment-list'

export interface DropdownServicesProps {
  environment: Environment
  deploymentHistory: DeploymentHistoryEnvironmentV2 | QueuedDeploymentRequestWithStages
  stages: DeploymentHistoryStage[] | QueuedDeploymentRequestWithStagesStagesInner[]
}

const isDeploymentStageQueue = (data: unknown): data is QueuedDeploymentRequestWithStagesStagesInner => {
  return typeof data === 'object' && data !== null && 'total_duration' in data
}

const MAX_VISIBLE_STAGES = 4

// XXX: This component includes a workaround to enable hover functionality
// for the DropdownMenu when using Radix, inspired by the discussion in this issue:
// https://github.com/radix-ui/primitives/issues/1294
export function DropdownServices({ environment, deploymentHistory, stages }: DropdownServicesProps) {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState<number | undefined>()
  const [direction, setDirection] = useState(0)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>()

  const setIndex = (stage: DeploymentHistoryStage | QueuedDeploymentRequestWithStagesStagesInner, index: number) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    if (currentIndex !== undefined) {
      setDirection(index > currentIndex ? 1 : -1)
    }

    // Necessary to prevent flickering
    const newTimeoutId = setTimeout(() => {
      if (stage.status !== 'SKIPPED') {
        setCurrentIndex(index)
      } else {
        setCurrentIndex(undefined)
      }
    }, 250)

    setTimeoutId(newTimeoutId)
  }

  const shouldTruncate = stages.length > MAX_VISIBLE_STAGES + 1
  const visibleStages = shouldTruncate ? stages.slice(0, MAX_VISIBLE_STAGES) : stages
  const remainingCount = shouldTruncate ? stages.length - MAX_VISIBLE_STAGES : 0

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <div className="flex">
        {visibleStages.map((stage, index) => (
          <DropdownMenu.Trigger
            key={index}
            onClick={() => {
              setIndex(stage, index)
              setOpen(true)
            }}
            onPointerEnter={() => {
              setIndex(stage, index)
              setOpen(true)
            }}
            onPointerLeave={() => setOpen(false)}
            style={{ pointerEvents: 'auto' }}
            className="flex items-center after:block after:h-[1px] after:w-0.5 after:bg-neutral-250 after:content-[''] last:after:hidden"
          >
            <StageStatusChip status={stage.status} />
          </DropdownMenu.Trigger>
        ))}
        {shouldTruncate && (
          <Link
            to={
              ENVIRONMENT_LOGS_URL(environment.organization.id, environment.project.id, environment.id) +
              ENVIRONMENT_STAGES_URL(
                match(deploymentHistory)
                  .with(P.when(isDeploymentHistory), (d) => d.identifier.execution_id)
                  .otherwise(() => undefined)
              )
            }
            state={{ prevUrl: pathname }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              className="flex items-center justify-center"
            >
              <path
                className="fill-neutral-100 stroke-neutral-250"
                d="M1.5 8.993v0c0-.91.23-1.804.669-2.591A5.098 5.098 0 013.99 4.507s0 0 0 0L9.49 1.2h0a4.863 4.863 0 012.508-.7 4.864 4.864 0 012.51.7l5.5 3.31h0a5.097 5.097 0 011.82 1.892c.439.787.67 1.68.671 2.59v6.015c0 .91-.23 1.804-.669 2.591a5.097 5.097 0 01-1.822 1.895l-5.5 3.307h0c-.763.459-1.628.7-2.508.7-.88 0-1.746-.241-2.51-.7 0 0 0 0 0 0l-5.5-3.31h0a5.098 5.098 0 01-1.82-1.892 5.333 5.333 0 01-.671-2.589V8.993z"
              />
              <text
                x="12"
                y="13"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="currentColor"
                className="text-ssm font-medium text-neutral-350"
              >
                {remainingCount}
              </text>
            </svg>
          </Link>
        )}
      </div>
      <DropdownMenu.Content
        loop
        asChild
        onPointerEnter={() => setOpen(true)}
        onPointerLeave={() => setOpen(false)}
        className={clsx(
          'relative flex max-h-96 w-56 flex-col overflow-y-scroll rounded-md bg-neutral-50 p-2 shadow-lg shadow-gray-900/10 data-[state=open]:data-[side=bottom]:animate-slidein-up-md-faded data-[state=open]:data-[side=left]:animate-slidein-right-sm-faded data-[state=open]:data-[side=right]:animate-slidein-left-md-faded data-[state=open]:data-[side=top]:animate-slidein-down-md-faded',
          {
            'hidden opacity-0': currentIndex === undefined,
            '-left-[38px]': stages.length === 4,
            '-left-[52px]': stages.length === 5,
            '-left-7': stages.length > 5,
          }
        )}
      >
        <div className="overflow-hidden">
          {currentIndex !== undefined && (
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={currentIndex}
                className="flex"
                initial={{
                  x: direction * 80 + '%',
                  opacity: 0,
                }}
                animate={{
                  x: 0,
                  opacity: 1,
                }}
                exit={{
                  x: direction * -80 + '%',
                  opacity: 0,
                  filter: 'blur(3px)',
                  transition: { ease: 'easeOut', duration: 0.22 },
                }}
                transition={{
                  x: { duration: 0.32, type: 'spring', bounce: 0 },
                  opacity: { duration: 0.4 },
                }}
              >
                {stages.map((stage, index) => (
                  <div
                    key={index}
                    className={twMerge(
                      clsx('hidden w-56 rounded border border-neutral-200', {
                        'flex flex-col': currentIndex === index,
                      })
                    )}
                  >
                    <div className="flex h-[54px] items-center gap-4 rounded-t bg-neutral-100 px-2 py-2.5">
                      <Indicator
                        align="end"
                        side="right"
                        content={
                          stage.status !== 'SKIPPED' && (
                            <Tooltip content={upperCaseFirstLetter(deploymentHistory.trigger_action)}>
                              <span>
                                <TriggerActionIcon
                                  triggerAction={deploymentHistory.trigger_action}
                                  className="relative -left-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-100 text-xs text-neutral-350"
                                />
                              </span>
                            </Tooltip>
                          )
                        }
                      >
                        <Tooltip content={upperCaseFirstLetter(stage.status)}>
                          <span>
                            <StageStatusChip status={stage.status} />
                          </span>
                        </Tooltip>
                      </Indicator>
                      <div className="flex flex-col text-neutral-400">
                        <span className="text-ssm font-medium">{upperCaseFirstLetter(stage.name)}</span>
                        {match(stage)
                          .with(P.when(isDeploymentStageQueue), () => null)
                          .otherwise((stage) =>
                            // XXX: Sometimes we don't have directly the duration in the stage object linked to queing
                            stage.duration ? (
                              <span className="text-[11px]">{formatDuration(stage.duration)}</span>
                            ) : null
                          )}
                      </div>
                    </div>
                    {match(stage)
                      .with(P.when(isDeploymentStageQueue), (s) =>
                        s.services.map((service, index) => {
                          return (
                            <DropdownMenu.Item
                              key={index}
                              className="flex h-[50px] w-full items-center gap-2 border-t border-neutral-200 pl-2 pr-3 text-xs text-neutral-400 transition-colors hover:bg-neutral-100 focus:bg-neutral-100 focus:outline-none"
                              asChild
                            >
                              <Link
                                to={
                                  ENVIRONMENT_LOGS_URL(
                                    environment.organization.id,
                                    environment.project.id,
                                    environment.id
                                  ) + ENVIRONMENT_STAGES_URL()
                                }
                                state={{ prevUrl: pathname }}
                              >
                                {service.details && (
                                  <ServiceAvatar
                                    border="solid"
                                    size="sm"
                                    service={
                                      'job_type' in service.details
                                        ? {
                                            icon_uri: service.icon_uri ?? '',
                                            serviceType: 'JOB' as const,
                                            job_type: service.details.job_type as 'CRON' | 'LIFECYCLE',
                                          }
                                        : {
                                            icon_uri: service.icon_uri ?? '',
                                            serviceType: service.identifier.service_type as Exclude<
                                              AnyService['service_type'],
                                              'JOB'
                                            >,
                                          }
                                    }
                                  />
                                )}
                                <span className="flex flex-col">
                                  <span className="truncate text-ssm">
                                    <Truncate text={service.identifier.name} truncateLimit={16} />
                                  </span>
                                </span>
                              </Link>
                            </DropdownMenu.Item>
                          )
                        })
                      )
                      .otherwise((s) =>
                        s.services.map((service, index) => (
                          <DropdownMenu.Item
                            key={index}
                            className="flex h-[50px] w-full items-center gap-2 border-t border-neutral-200 pl-2 pr-3 text-xs text-neutral-400 transition-colors hover:bg-neutral-100 focus:bg-neutral-100 focus:outline-none"
                            asChild
                          >
                            <Link
                              to={
                                ENVIRONMENT_LOGS_URL(
                                  environment.organization.id,
                                  environment.project.id,
                                  environment.id
                                ) +
                                DEPLOYMENT_LOGS_VERSION_URL(
                                  service.identifier.service_id,
                                  service.identifier.execution_id
                                )
                              }
                              state={{ prevUrl: pathname }}
                            >
                              {service.details && (
                                <ServiceAvatar
                                  border="solid"
                                  size="sm"
                                  service={
                                    'job_type' in service.details
                                      ? {
                                          icon_uri: service.icon_uri ?? '',
                                          serviceType: 'JOB' as const,
                                          job_type: service.details.job_type as 'CRON' | 'LIFECYCLE',
                                        }
                                      : {
                                          icon_uri: service.icon_uri ?? '',
                                          serviceType: service.identifier.service_type as Exclude<
                                            AnyService['service_type'],
                                            'JOB'
                                          >,
                                        }
                                  }
                                />
                              )}
                              <span className="flex flex-col">
                                <span className="truncate text-ssm">
                                  <Truncate text={service.identifier.name} truncateLimit={16} />
                                </span>
                                {service.total_duration && (
                                  <>
                                    <span
                                      title={dateUTCString(service.auditing_data.updated_at)}
                                      className="text-[11px]"
                                    >
                                      {formatDurationMinutesSeconds(service.total_duration ?? '')}
                                    </span>
                                  </>
                                )}
                              </span>
                              {service.status_details && (
                                <span className="ml-auto">
                                  <StatusChip status={service.status_details.status} />
                                </span>
                              )}
                            </Link>
                          </DropdownMenu.Item>
                        ))
                      )}
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

export default DropdownServices
