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

      <Callout.Root color="yellow" className="mt-3">
        <Callout.Icon>
          <Icon iconName="triangle-exclamation" iconStyle="regular" />
        </Callout.Icon>
        <Callout.Text>
          <p>Always assume one instance may fail due to node maintenance or issues.</p>
          <p>To ensure high availability, set Minimum Instances to 2 if your app can run on 1 instance.</p>
          <p>
            If your application requires more than one instance to handle necessary traffic, set the minimum to 3 or
            higher to guarantee redundancy during a single failure.
          </p>
        </Callout.Text>
      </Callout.Root>

      <KedaScalersFields control={control} scalersFieldArray={scalersFieldArray} disabled={disabled} />
    </>
  )
}
