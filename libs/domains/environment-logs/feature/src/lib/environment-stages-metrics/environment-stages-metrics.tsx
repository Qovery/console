import { type CheckedState } from '@radix-ui/react-checkbox'
import {
  type DeploymentHistoryEnvironmentV2,
  type DeploymentStageWithServicesStatuses,
  type Environment,
  type EnvironmentStatus,
  type EnvironmentStatusesWithStagesPreCheckStage,
} from 'qovery-typescript-axios'
import { type Dispatch, type PropsWithChildren, type SetStateAction } from 'react'
import { NavLink } from 'react-router-dom'
import { ENVIRONMENT_LOGS_URL, ENVIRONMENT_PRE_CHECK_LOGS_URL } from '@qovery/shared/routes'
import { Checkbox, Icon, LoaderSpinner, StageStatusChip, StatusChip, Tooltip } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { HeaderEnvironmentStages } from '../header-environment-stages/header-environment-stages'

export interface EnvironmentStagesMetricsProps extends PropsWithChildren {
  environment: Environment
  environmentStatus: EnvironmentStatus
  hideSkipped: CheckedState
  setHideSkipped: Dispatch<SetStateAction<CheckedState>>
  deploymentStages?: DeploymentStageWithServicesStatuses[]
  preCheckStage?: EnvironmentStatusesWithStagesPreCheckStage
  deploymentHistory?: DeploymentHistoryEnvironmentV2
}

export function EnvironmentStagesMetrics({
  environment,
  environmentStatus,
  deploymentStages,
  deploymentHistory,
  preCheckStage,
  hideSkipped,
  setHideSkipped,
  children,
}: EnvironmentStagesMetricsProps) {
  const executionId = environmentStatus.last_deployment_id

  return (
    <div className="h-[calc(100vh-64px)] w-[calc(100vw-64px)] p-1">
      <HeaderEnvironmentStages
        environment={environment}
        environmentStatus={environmentStatus}
        deploymentHistory={deploymentHistory}
      >
        <div className="flex items-center gap-3 text-sm font-medium text-neutral-50">
          <Checkbox
            name="skipped"
            id="skipped"
            className="shrink-0"
            color="brand"
            checked={hideSkipped}
            onCheckedChange={setHideSkipped}
          />
          <label htmlFor="skipped">Hide skipped</label>
        </div>
      </HeaderEnvironmentStages>

      <div className="flex h-[calc(100vh-120px)] justify-center border border-t-0 border-neutral-500 bg-neutral-600">
        <div className="h-full w-full">
          <div className="flex h-full gap-0.5 overflow-y-scroll py-6 pl-4 pr-3">
            {!deploymentStages ? (
              <div className="mt-6 flex h-full w-full justify-center">
                <LoaderSpinner className="h-6 w-6" theme="dark" />
              </div>
            ) : (
              children
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnvironmentStagesMetrics
