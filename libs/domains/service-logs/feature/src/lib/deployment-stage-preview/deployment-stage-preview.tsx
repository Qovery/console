import clsx from 'clsx'
import { type ServiceStepMetric, type StateEnum, type Status } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { StatusChip } from '@qovery/shared/ui'
import { twMerge, upperCaseFirstLetter } from '@qovery/shared/util-js'

type StepMetricType = { build: ServiceStepMetric[]; deploy: ServiceStepMetric[] }

interface StageStep {
  type: 'BUILD' | 'DEPLOY'
  state: StateEnum
  steps: ServiceStepMetric[]
}

function Stage({ type, state, steps }: StageStep) {
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

  return (
    <button
      className={twMerge(
        clsx(
          'flex items-center gap-1.5 rounded-lg border border-neutral-500 bg-neutral-650 px-2.5 py-1 text-sm font-medium text-neutral-300 transition',
          {
            'text-white hover:border-green-500 hover:bg-neutral-500': status === 'SUCCESS',
            'text-white hover:border-red-500 hover:bg-neutral-500': status === 'ERROR',
            'border-brand-500 bg-neutral-500 text-white':
              (type === 'BUILD' && status === 'BUILDING') || (type === 'DEPLOY' && status === 'DEPLOYING'),
          }
        )
      )}
    >
      <StatusChip status={status} />
      {upperCaseFirstLetter(type.toLowerCase())}
      {totalDurationSec > 0 ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="5" height="6" fill="none" viewBox="0 0 5 6">
            <circle cx="2.5" cy="3" r="2.5" fill="#383E50"></circle>
          </svg>
          <span>
            {Math.floor(totalDurationSec / 60)}m : {totalDurationSec % 60}s
          </span>
        </>
      ) : null}
    </button>
  )
}

export interface DeploymentStagePreviewInterface {
  serviceStatus: Status
}

export function DeploymentStagePreview({ serviceStatus: { steps, state } }: DeploymentStagePreviewInterface) {
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
      <Stage type="BUILD" state={state} steps={categorizedSteps.build} />
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="8" fill="none" viewBox="0 0 16 8">
        <path fill="#383E50" d="M0 8a4 4 0 000-8v8z"></path>
        <path fill="#383E50" d="M2 3H14V5H2z"></path>
        <path fill="#383E50" d="M16 8a4 4 0 110-8v8z"></path>
      </svg>
      <Stage type="DEPLOY" state={state} steps={categorizedSteps.deploy} />
    </div>
  )
}

export default DeploymentStagePreview
