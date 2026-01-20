import { type Control, type FieldValues, type UseFormSetValue } from 'react-hook-form'
import { HpaMetricFields, InstancesRangeInputs } from '@qovery/domains/services/feature'
import { Callout, Icon } from '@qovery/shared/ui'

export interface HpaAutoscalingModeProps {
  control: Control
  setValue: UseFormSetValue<FieldValues>
  minInstances: number
  maxInstances: number
  minRunningInstances: number
  hpaMetricType: string
  hpaAverageUtilizationPercent: number
  hpaMemoryAverageUtilizationPercent: number
  runningPods?: number
}

export function HpaAutoscalingMode({
  control,
  setValue,
  minInstances,
  maxInstances,
  minRunningInstances,
  hpaMetricType,
  hpaAverageUtilizationPercent,
  hpaMemoryAverageUtilizationPercent,
  runningPods,
}: HpaAutoscalingModeProps) {
  return (
    <>
      <InstancesRangeInputs
        control={control}
        minInstances={minInstances}
        maxInstances={maxInstances}
        minRunningInstances={minRunningInstances}
        showMaxField={true}
        runningPods={runningPods}
        requireMinLessThanMax={true}
      />

      <Callout.Root color="sky" className="mt-3">
        <Callout.Icon>
          <Icon iconName="circle-info" iconStyle="regular" />
        </Callout.Icon>
        <Callout.Text>
          Auto-scaling will automatically scale your service based on{' '}
          {hpaMetricType === 'CPU_AND_MEMORY' ? 'CPU and Memory' : 'CPU'} utilization. Scaling occurs when the average
          exceeds
          {hpaMetricType === 'CPU_AND_MEMORY'
            ? ` CPU ${hpaAverageUtilizationPercent}% and Memory ${hpaMemoryAverageUtilizationPercent}%`
            : ` ${hpaAverageUtilizationPercent}%`}{' '}
          for a continuous period.
        </Callout.Text>
      </Callout.Root>

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

      <HpaMetricFields control={control} setValue={setValue} hpaMetricType={hpaMetricType} />
    </>
  )
}
