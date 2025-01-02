import clsx from 'clsx'
import { type ServiceStepMetric, type StateEnum, type Status } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { P, match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import { isHelmRepositorySource, isJobContainerSource } from '@qovery/shared/enums'
import { Icon, StatusChip, Tooltip } from '@qovery/shared/ui'
import { twMerge, upperCaseFirstLetter } from '@qovery/shared/util-js'
import { type FilterType } from '../list-deployment-logs'

type StepMetricType = { build: ServiceStepMetric[]; deploy: ServiceStepMetric[] }

interface StageStepProps {
  type: Extract<FilterType, 'BUILD' | 'DEPLOY'>
  state: StateEnum
  steps: ServiceStepMetric[]
  toggleColumnFilter: (type: FilterType) => void
  isFilterActive: (type: FilterType) => boolean
}

function StageStep({ type, state, steps, toggleColumnFilter, isFilterActive }: StageStepProps) {
  const { hash } = useLocation()
  const totalDurationSec = steps.reduce((acc, step) => acc + (step.duration_sec || 0), 0)

  const buildStep = steps.find((s) => s.step_name === 'BUILD')
  const deployStep = steps.find((s) => s.step_name === 'DEPLOYMENT')

  const status = match({ type, state, buildStep, deployStep })
    .with({ type: 'BUILD' }, () => {
      if (state === 'BUILDING') return 'BUILDING'
      return buildStep?.status
    })
    .with({ type: 'DEPLOY' }, () => {
      if (state === 'BUILDING') return 'READY'
      if (state === 'DEPLOYING') return 'DEPLOYING'
      return deployStep?.status
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
  }, [status, toggleColumnFilter, isFirstLoad, hash])

  const isBuildingOrDeploying =
    (type === 'BUILD' && status === 'BUILDING') || (type === 'DEPLOY' && status === 'DEPLOYING')

  const buttonClasses = clsx(
    'flex items-center gap-1.5 rounded-lg border border-neutral-500 bg-neutral-650 px-2.5 py-1 text-sm font-medium text-neutral-300 transition hover:border-neutral-300 hover:bg-neutral-500',
    {
      'text-white hover:border-green-500': status === 'SUCCESS',
      'text-white hover:border-red-500': status === 'ERROR',
      'text-white hover:border-brand-500': isBuildingOrDeploying,
      'border-brand-500 bg-neutral-500': isBuildingOrDeploying && isFilterActive(type),
      'border-green-500': status === 'SUCCESS' && isFilterActive(type),
      'border-red-500 bg-neutral-500': status === 'ERROR' && isFilterActive(type),
    }
  )

  return (
    <button className={twMerge(buttonClasses)} onClick={() => toggleColumnFilter(type)}>
      <StatusChip status={status} />
      {upperCaseFirstLetter(type.toLowerCase())}
      {totalDurationSec > 0 ? (
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
              steps.map((step) => (
                <span key={step.step_name} className="font-medium">
                  {upperCaseFirstLetter(step.step_name)?.replace(/_/g, ' ')}:{' '}
                  {step.duration_sec ? (
                    <>
                      {Math.floor(step.duration_sec / 60)}m {step.duration_sec % 60}s
                    </>
                  ) : (
                    '0s'
                  )}
                </span>
              ))
            ) : (
              <span>No detail available</span>
            )}
          </span>
        }
        side="bottom"
      >
        <span>
          <Icon iconName="circle-info" iconStyle="regular" />
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

  const categorizedSteps = steps.details.reduce(
    (acc, step) => {
      if (!step.step_name) return acc

      match(step.step_name)
        .with('BUILD', 'BUILD_QUEUEING', 'GIT_CLONE', 'REGISTRY_CREATE_REPOSITORY', () => acc.build.push(step))
        .with('DEPLOYMENT', 'DEPLOYMENT_QUEUEING', 'ROUTER_DEPLOYMENT', 'MIRROR_IMAGE', () => acc.deploy.push(step))
        .exhaustive()

      return acc
    },
    { build: [], deploy: [] } as StepMetricType
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
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="8" fill="none" viewBox="0 0 16 8">
            <path fill="#383E50" d="M0 8a4 4 0 000-8v8z"></path>
            <path fill="#383E50" d="M2 3H14V5H2z"></path>
            <path fill="#383E50" d="M16 8a4 4 0 110-8v8z"></path>
          </svg>
        </>
      )}
      <StageStep
        type="DEPLOY"
        state={state}
        steps={categorizedSteps.deploy}
        isFilterActive={isFilterActive}
        toggleColumnFilter={toggleColumnFilter}
      />
    </div>
  )
}

export default FiltersStageStep
