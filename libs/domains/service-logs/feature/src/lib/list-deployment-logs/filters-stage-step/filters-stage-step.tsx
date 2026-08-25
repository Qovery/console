import { useLocation } from '@tanstack/react-router'
import clsx from 'clsx'
import { type ServiceStepMetric, type StateEnum, type Status } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { P, match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import { isHelmRepositorySource, isJobContainerSource } from '@qovery/shared/enums'
import { Icon, StatusChip, Tooltip } from '@qovery/shared/ui'
import { twMerge, upperCaseFirstLetter } from '@qovery/shared/util-js'
import { type FilterType } from '../list-deployment-logs'

type ServiceStepMetricWithLifecycle = Omit<ServiceStepMetric, 'status'> & {
  status?: ServiceStepMetric['status'] | 'ONGOING'
  started_at?: string | null
}
type StepMetricType = {
  build: ServiceStepMetricWithLifecycle[]
  deploy: ServiceStepMetricWithLifecycle[]
  executing: ServiceStepMetricWithLifecycle[]
}

const getStepDurationSec = (step: ServiceStepMetricWithLifecycle, nowMs: number) => {
  if (step.status !== 'ONGOING' || !step.started_at) return step.duration_sec || 0

  const startedAtMs = Date.parse(step.started_at)
  return Number.isFinite(startedAtMs) ? Math.max(0, Math.floor((nowMs - startedAtMs) / 1_000)) : 0
}

interface StageStepProps {
  type: Extract<FilterType, 'BUILD' | 'DEPLOY' | 'EXECUTING'>
  state: StateEnum
  steps: ServiceStepMetricWithLifecycle[]
  toggleColumnFilter: (type: FilterType) => void
  isFilterActive: (type: FilterType) => boolean
}

function StageStep({ type, state, steps, toggleColumnFilter, isFilterActive }: StageStepProps) {
  const { hash } = useLocation()
  const nowMs = Date.now()
  const totalDurationSec = steps.reduce((acc, step) => acc + getStepDurationSec(step, nowMs), 0)
  const hasLiveDuration = steps.some(
    (step) =>
      step.status === 'ONGOING' && Boolean(step.started_at) && Number.isFinite(Date.parse(step.started_at ?? ''))
  )

  const buildStep = steps.find((s) => s.step_name === 'BUILD')
  const deployStep = steps.find((s) => s.step_name === 'DEPLOYMENT')
  const executingStep = steps.find((s) => s.step_name === 'EXECUTING')

  const status = match({ type, state, buildStep, deployStep })
    .with({ type: 'BUILD' }, () => {
      if (state === 'BUILDING' || hasLiveDuration) return 'BUILDING'
      return buildStep?.status
    })
    .with({ type: 'DEPLOY' }, () => {
      if (state === 'BUILDING') return 'READY'
      if (state === 'DEPLOYING' || hasLiveDuration) return 'DEPLOYING'
      return deployStep?.status
    })
    .with({ type: 'EXECUTING' }, () => {
      if (state === 'EXECUTING' || hasLiveDuration) return 'EXECUTING'
      return executingStep?.status
    })
    .exhaustive()

  const [isFirstLoad, setIsFirstLoad] = useState(true)
  useEffect(() => {
    if (hash) return

    if (isFirstLoad) {
      if (status === 'ERROR') {
        toggleColumnFilter(type)
      }
      setIsFirstLoad(false)
    } else if (status === 'ERROR') {
      // Only toggle if status is 'ERROR'
      toggleColumnFilter(type)
    }
    // On the first load, if status is 'ERROR', the column filter is toggled
    // For all subsequent renders, the column filter is toggled only if the status is 'ERROR'
  }, [status, toggleColumnFilter, isFirstLoad, hash, type])

  const isStepRunning =
    (type === 'BUILD' && status === 'BUILDING') ||
    (type === 'DEPLOY' && status === 'DEPLOYING') ||
    (type === 'EXECUTING' && status === 'EXECUTING')
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!hasLiveDuration) return

    const intervalId = window.setInterval(() => setTick((tick) => tick + 1), 1_000)
    return () => window.clearInterval(intervalId)
  }, [hasLiveDuration])

  const shouldDisplayDuration = hasLiveDuration || totalDurationSec > 0

  const buttonClasses = clsx(
    'flex h-8 items-center gap-1.5 rounded-lg border border-neutral bg-surface-neutral px-2.5 text-sm font-medium text-neutral-subtle transition hover:border-neutral-subtle hover:bg-surface-neutral-component',
    {
      'border-neutral-strong bg-surface-neutral-subtle text-neutral': isFilterActive(type),
      'border-brand-component bg-surface-brand-subtle': isStepRunning && isFilterActive(type),
      'border-positive-strong bg-surface-positive-subtle': status === 'SUCCESS' && isFilterActive(type),
      'border-negative-strong bg-surface-negative-subtle': status === 'ERROR' && isFilterActive(type),
    }
  )

  return (
    <button className={twMerge(buttonClasses)} onClick={() => toggleColumnFilter(type)}>
      <StatusChip status={status} />
      {upperCaseFirstLetter(type.toLowerCase())}
      {shouldDisplayDuration ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="5" height="6" fill="none" viewBox="0 0 5 6">
            <circle cx="2.5" cy="3" r="2.5" fill="#383E50" />
          </svg>
          <span>
            {Math.floor(totalDurationSec / 60)}m : {totalDurationSec % 60}s
          </span>
        </>
      ) : null}
      <Tooltip
        content={
          <span className="flex flex-col gap-0.5">
            {steps.length > 0 ? (
              steps.map((step, index) => {
                const durationSec = getStepDurationSec(step, nowMs)

                return (
                  <span key={`${step.step_name}-${index}`} className="font-medium">
                    {upperCaseFirstLetter(step.step_name)?.replace(/_/g, ' ')}:{' '}
                    {durationSec ? (
                      <>
                        {Math.floor(durationSec / 60)}m {durationSec % 60}s
                      </>
                    ) : (
                      '0s'
                    )}
                  </span>
                )
              })
            ) : (
              <span>No detail available</span>
            )}
          </span>
        }
        side="bottom"
      >
        <span>
          <Icon iconName="circle-info" iconStyle="regular" className="text-neutral-subtle" />
        </span>
      </Tooltip>
    </button>
  )
}

export interface FiltersStageStepProps {
  serviceStatus: Status
  toggleColumnFilter: (type: FilterType) => void
  isFilterActive: (type: FilterType) => boolean
  service?: AnyService
}

export function FiltersStageStep({
  serviceStatus: { steps, state },
  toggleColumnFilter,
  isFilterActive,
  service,
}: FiltersStageStepProps) {
  if (!steps?.details) return <div />

  const categorizedSteps = (steps.details as ServiceStepMetricWithLifecycle[]).reduce(
    (acc, step) => {
      if (!step.step_name) return acc

      match(step.step_name)
        .with('BUILD', 'BUILD_QUEUEING', 'GIT_CLONE', 'REGISTRY_CREATE_REPOSITORY', () => acc.build.push(step))
        .with('DEPLOYMENT', 'DEPLOYMENT_QUEUEING', 'ROUTER_DEPLOYMENT', 'MIRROR_IMAGE', () => acc.deploy.push(step))
        .with('EXECUTING', () => acc.executing.push(step))
        .exhaustive()

      return acc
    },
    { build: [], deploy: [], executing: [] } as StepMetricType
  )

  return (
    <div className="flex items-center">
      {match(service)
        .with({ serviceType: 'CONTAINER' }, () => false)
        .with({ serviceType: 'DATABASE', mode: 'CONTAINER' }, () => false)
        .with({ serviceType: 'JOB', source: P.when(isJobContainerSource) }, () => false)
        .with({ serviceType: 'HELM', values_override: P.when(isHelmRepositorySource) }, () => false)
        .otherwise(() => true) && (
        <>
          <StageStep
            type="BUILD"
            state={state}
            steps={categorizedSteps.build}
            isFilterActive={isFilterActive}
            toggleColumnFilter={toggleColumnFilter}
          />
          <Separator />
        </>
      )}
      <StageStep
        type="DEPLOY"
        state={state}
        steps={categorizedSteps.deploy}
        isFilterActive={isFilterActive}
        toggleColumnFilter={toggleColumnFilter}
      />
      {service?.serviceType === 'TERRAFORM' && (
        <>
          <Separator />
          <StageStep
            type="EXECUTING"
            state={state}
            steps={categorizedSteps.executing}
            isFilterActive={isFilterActive}
            toggleColumnFilter={toggleColumnFilter}
          />
        </>
      )}
    </div>
  )
}

const Separator = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="8" fill="none" viewBox="0 0 16 8">
      <path fill="var(--neutral-6)" d="M0 8a4 4 0 000-8v8z"></path>
      <path fill="var(--neutral-6)" d="M2 3H14V5H2z"></path>
      <path fill="var(--neutral-6)" d="M16 8a4 4 0 110-8v8z"></path>
    </svg>
  )
}

export default FiltersStageStep
