import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import { type Control, type UseFieldArrayReturn } from 'react-hook-form'
import { Callout, Icon } from '@qovery/shared/ui'
import { InstancesRangeInputs } from './instances-range-inputs'
import { KedaScalersFields } from './keda-scalers-fields'

export interface KedaSettingsProps {
  control: Control
  scalersFieldArray: UseFieldArrayReturn
  minInstances: number
  maxInstances: number
  minRunningInstances?: number
  disabled?: boolean
  runningPods?: number
  environmentMode?: EnvironmentModeEnum
}

export function KedaSettings({
  control,
  scalersFieldArray,
  minInstances,
  maxInstances,
  minRunningInstances,
  disabled = false,
  runningPods,
  environmentMode,
}: KedaSettingsProps) {
  const isProduction = environmentMode === EnvironmentModeEnum.PRODUCTION
  const hasLowMinimum = (minRunningInstances ?? 0) <= 1

  return (
    <>
      <InstancesRangeInputs
        control={control}
        minInstances={minInstances}
        maxInstances={maxInstances}
        minRunningInstances={minRunningInstances}
        disabled={disabled}
        showMaxField={true}
        runningPods={runningPods}
        requireMinLessThanMax={true}
      />

      <Callout.Root color="sky" className="mt-3">
        <Callout.Icon>
          <Icon iconName="circle-info" iconStyle="regular" />
        </Callout.Icon>
        <Callout.Text>
          <p>
            For applications requiring high availability, set Minimum Instances to at least 2 to maintain service
            availability during pod failures or cluster maintenance.
          </p>
        </Callout.Text>
      </Callout.Root>

      <KedaScalersFields control={control} scalersFieldArray={scalersFieldArray} disabled={disabled} />
    </>
  )
}
