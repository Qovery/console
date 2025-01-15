import {
  type Cluster,
  type ClusterFeatureKarpenterParameters,
  KarpenterDefaultNodePoolOverride,
  type KarpenterNodePool,
  KarpenterStableNodePoolOverride,
  WeekdayEnum,
} from 'qovery-typescript-axios'
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form'
import { Callout, Icon, InputSelect, InputText, InputToggle, ModalCrud, Tooltip, useModal } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

function LimitsFields({ type }: { type: 'default' | 'stable' }) {
  const { control } = useFormContext()

  const name = `${type === 'default' ? 'default_override' : 'stable_override'}.limits`

  return (
    <>
      <Controller
        name={`${name}.max_cpu_in_vcpu`}
        control={control}
        rules={{
          required: 'Please enter a value.',
          min: CPU_MIN,
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            type="number"
            name={field.name}
            label="vCPU"
            value={field.value}
            onChange={field.onChange}
            hint={`Minimum value is ${CPU_MIN} vCPU`}
            error={error?.type === 'min' ? `Minimum allowed is: ${CPU_MIN} milli vCPU.` : undefined}
          />
        )}
      />
      <Controller
        name={`${name}.max_memory_in_gibibytes`}
        control={control}
        rules={{
          required: 'Please enter a value.',
          min: MEMORY_MIN,
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            type="number"
            name={field.name}
            label="Memory (GiB)"
            value={field.value}
            onChange={field.onChange}
            hint={`Minimum value is ${MEMORY_MIN} GiB`}
            error={error?.type === 'min' ? `Minimum allowed is: ${MEMORY_MIN} GiB.` : undefined}
          />
        )}
      />
    </>
  )
}

export interface NodepoolModalProps {
  type: 'stable' | 'default'
  cluster: Cluster
  onChange: (data: KarpenterNodePool) => void
  defaultValues?: KarpenterStableNodePoolOverride | KarpenterDefaultNodePoolOverride
}

const CPU_MIN = 6
const MEMORY_MIN = 10

export function NodepoolModal({ type, cluster, onChange, defaultValues }: NodepoolModalProps) {
  const { closeModal } = useModal()

  const karpenterNodePools = (
    cluster.features?.find((feature) => feature.id === 'KARPENTER')?.value_object
      ?.value as ClusterFeatureKarpenterParameters
  ).qovery_node_pools

  const methods = useForm<Omit<KarpenterNodePool, 'requirements'>>({
    mode: 'onChange',
    defaultValues: {
      default_override: defaultValues,
      stable_override: {
        ...defaultValues,
        ...{
          consolidation: {
            ...(defaultValues as KarpenterStableNodePoolOverride).consolidation,
            start_time: (defaultValues as KarpenterStableNodePoolOverride)?.consolidation?.start_time.replace('PT', ''),
            duration: (defaultValues as KarpenterStableNodePoolOverride)?.consolidation?.duration.replace('PT', ''),
          },
        },
      },
    },
  })

  const watchConsolidation = methods.watch('stable_override.consolidation.enabled')

  const onSubmit = methods.handleSubmit(async (data) => {
    onChange({
      ...karpenterNodePools,
      ...(type === 'default'
        ? {
            default_override: {
              limits: {
                max_cpu_in_vcpu: data.default_override?.limits?.max_cpu_in_vcpu ?? CPU_MIN,
                max_memory_in_gibibytes: data.default_override?.limits?.max_memory_in_gibibytes ?? MEMORY_MIN,
              },
            },
          }
        : {
            stable_override: {
              limits: {
                max_cpu_in_vcpu: data.stable_override?.limits?.max_cpu_in_vcpu ?? CPU_MIN,
                max_memory_in_gibibytes: data.stable_override?.limits?.max_memory_in_gibibytes ?? MEMORY_MIN,
              },
              consolidation: {
                enabled: data.stable_override?.consolidation?.enabled ?? false,
                days: data.stable_override?.consolidation?.days ?? [],
                start_time: data.stable_override?.consolidation?.start_time
                  ? `PT${data.stable_override?.consolidation?.start_time}`
                  : '',
                duration: data.stable_override?.consolidation?.duration
                  ? `PT${data.stable_override?.consolidation?.duration.toUpperCase()}`
                  : '',
              },
            },
          }),
    })

    closeModal()
  })

  const daysOptions = Object.keys(WeekdayEnum).map((key) => ({
    label: upperCaseFirstLetter(key),
    value: key,
  }))

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title="Nodepool stable"
        description={
          type === 'stable'
            ? 'Used for single instances and internal Qovery applications, such as containerized databases, to maintain stability.'
            : 'Used for single instances and internal Qovery applications, such as containerized databases, to maintain stability.'
        }
        onSubmit={onSubmit}
        onClose={closeModal}
        submitLabel="Confirm"
      >
        <div className="mb-6 flex flex-col gap-4 rounded border border-neutral-250 bg-neutral-100 p-4">
          <div className="flex justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-neutral-400">Nodepool resources limits</p>
              <p className="text-sm text-neutral-350">Limit resources to control usage and avoid unexpected costs. </p>
            </div>
            <Tooltip
              classNameContent="w-80"
              content="This section is dedicated to configuring the CPU and memory limits for the Nodepool. Nodes can be deployed within these limits, ensuring that their total resources do not exceed the defined maximum. This configuration helps prevent unlimited resource allocation, avoiding excessive costs."
            >
              <span className="text-neutral-400">
                <Icon iconName="circle-info" iconStyle="regular" />
              </span>
            </Tooltip>
          </div>
          <LimitsFields type={type} />
        </div>
        <div className="flex flex-col gap-4 rounded border border-neutral-250 bg-neutral-100 p-4">
          {type === 'default' && (
            <div className="flex gap-3">
              <Tooltip content="Consolidation cannot be disabled on this NodePool">
                <span>
                  <InputToggle value={true} forceAlignTop disabled small />
                </span>
              </Tooltip>
              <div className="relative -top-0.5 text-sm">
                <p className="font-medium text-neutral-400">Operates every day, 24 hours a day</p>
                <span className="text-neutral-350">
                  Define when consolidation occurs to optimize resource usage by reducing the number of active nodes.
                </span>
              </div>
            </div>
          )}
          {type === 'stable' && (
            <>
              <Controller
                name="stable_override.consolidation.enabled"
                control={methods.control}
                render={({ field }) => (
                  <div className="flex gap-2">
                    <InputToggle
                      value={field.value}
                      onChange={field.onChange}
                      title="Consolidation schedule"
                      description="Define when consolidation occurs to optimize resource usage by reducing the number of active nodes."
                      forceAlignTop
                      small
                    />
                    <Tooltip
                      classNameContent="w-80"
                      content="Consolidation optimizes resource usage by consolidating workloads onto fewer nodes. This schedule applies to Nodepools used by Qovery’s internal applications and single-instance applications (like container databases)"
                    >
                      <span className="text-neutral-400">
                        <Icon iconName="circle-info" iconStyle="regular" />
                      </span>
                    </Tooltip>
                  </div>
                )}
              />
              {watchConsolidation && (
                <div className="ml-11 flex flex-col gap-4">
                  <Callout.Root className="items-center" color="yellow">
                    <Callout.Text>Some downtime may occur during this process.</Callout.Text>
                  </Callout.Root>
                  <Controller
                    name="stable_override.consolidation.start_time"
                    control={methods.control}
                    rules={{ required: 'Please enter a start time.' }}
                    render={({ field, fieldState: { error } }) => (
                      <InputText
                        label={`Start time (${cluster.region})`}
                        name={field.name}
                        type="time"
                        onChange={field.onChange}
                        value={field.value}
                        error={error?.message}
                      />
                    )}
                  />
                  <Controller
                    name="stable_override.consolidation.duration"
                    control={methods.control}
                    rules={{ required: 'Please enter a duration.' }}
                    render={({ field, fieldState: { error } }) => (
                      <InputText
                        name={field.name}
                        label="Duration"
                        value={field.value}
                        onChange={field.onChange}
                        hint="The duration format uses 'h' for hours and 'm' for minutes, so '2h10m' represents 2 hours and 10 minutes."
                        error={error?.message}
                      />
                    )}
                  />
                  <Controller
                    name="stable_override.consolidation.days"
                    control={methods.control}
                    rules={{ required: 'Please select at least one day.' }}
                    render={({ field, fieldState: { error } }) => (
                      <InputSelect
                        label="Days"
                        value={field.value}
                        options={daysOptions}
                        onChange={field.onChange}
                        error={error?.message}
                        isMulti
                      />
                    )}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </ModalCrud>
    </FormProvider>
  )
}

export default NodepoolModal
