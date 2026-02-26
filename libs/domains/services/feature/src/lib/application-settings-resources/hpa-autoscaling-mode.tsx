import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import { type Control, type FieldValues, type UseFormSetValue } from 'react-hook-form'
import { Callout, Icon } from '@qovery/shared/ui'
import { HpaMetricFields } from '../keda/components/hpa-metric-fields'
import { InstancesRangeInputs } from '../keda/components/instances-range-inputs'

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
  environmentMode?: EnvironmentModeEnum
}

export function HpaAutoscalingMode({
  control,
  setValue,
  minInstances,
  maxInstances,
  minRunningInstances,
  hpaMetricType,
  runningPods,
  environmentMode,
}: HpaAutoscalingModeProps) {
  const isProduction = environmentMode === EnvironmentModeEnum.PRODUCTION
  const hasSingleInstance = minRunningInstances <= 1

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

      {isProduction && hasSingleInstance && (
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
            <p className="mt-2 font-medium">
              We strongly discourage running your production environment with only one instance. This setup might create
              service downtime in case of cluster upgrades.
            </p>
          </Callout.Text>
        </Callout.Root>
      )}

      <HpaMetricFields control={control} setValue={setValue} hpaMetricType={hpaMetricType} />
    </>
  )
}
