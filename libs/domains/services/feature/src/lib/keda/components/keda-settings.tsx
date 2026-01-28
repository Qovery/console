import { type Control, type UseFieldArrayReturn } from 'react-hook-form'
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
}

export function KedaSettings({
  control,
  scalersFieldArray,
  minInstances,
  maxInstances,
  minRunningInstances,
  disabled = false,
  runningPods,
}: KedaSettingsProps) {
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

      <KedaScalersFields control={control} scalersFieldArray={scalersFieldArray} disabled={disabled} />
    </>
  )
}
