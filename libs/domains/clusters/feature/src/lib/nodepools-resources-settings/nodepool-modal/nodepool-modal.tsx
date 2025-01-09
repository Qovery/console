import {
  type Cluster,
  ClusterFeatureKarpenterParameters,
  type KarpenterDefaultNodePoolOverride,
  type KarpenterStableNodePoolOverride,
  WeekdayEnum,
} from 'qovery-typescript-axios'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { P, match } from 'ts-pattern'
import { Callout, Icon, InputSelect, InputText, InputToggle, ModalCrud, Tooltip, useModal } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { useEditCluster } from '../../hooks/use-edit-cluster/use-edit-cluster'

export interface NodepoolModalProps {
  type: 'stable' | 'default'
  cluster: Cluster
}

const CPU_MIN = 6
const MEMORY_MIN = 10

export function NodepoolModal({ type, cluster }: NodepoolModalProps) {
  const { mutateAsync: editCluster, isLoading: isLoadingEditCluster } = useEditCluster()
  const { closeModal } = useModal()

  const karpenterNodePools = (
    cluster.features?.find((feature) => feature.id === 'KARPENTER')?.value_object
      ?.value as ClusterFeatureKarpenterParameters
  ).qovery_node_pools

  const methods = useForm<KarpenterStableNodePoolOverride | KarpenterDefaultNodePoolOverride>({
    mode: 'onChange',
    defaultValues: type === 'stable' ? karpenterNodePools.stable_override : karpenterNodePools.default_override,
  })

  console.log(karpenterNodePools)

  const watchConsolidation = methods.watch('consolidation.enabled')

  const onSubmit = methods.handleSubmit(async (data) => {
    // TODO: Fix duration format and other format issues
    try {
      await editCluster({
        organizationId: cluster.organization.id,
        clusterId: cluster.id,
        clusterRequest: {
          ...cluster,
          features: cluster.features?.map((feature) => {
            if (feature.id === 'KARPENTER') {
              return {
                id: 'KARPENTER',
                value: {
                  ...(feature.value_object?.value as ClusterFeatureKarpenterParameters),
                  ...match({ type, data })
                    .with(
                      {
                        type: 'stable',
                        data: P.when((d): d is KarpenterStableNodePoolOverride => 'consolidation' in d),
                      },
                      ({ data }) => {
                        return {
                          qovery_node_pools: {
                            ...karpenterNodePools,
                            stable_override: {
                              ...data,
                              consolidation: {
                                ...data.consolidation,
                                enabled: data.consolidation?.enabled ?? false,
                                duration: `PT${data.consolidation?.duration}`,
                              },
                            },
                          },
                        }
                      }
                    )
                    .with({ type: 'default' }, ({ data }) => ({
                      ...karpenterNodePools,
                      default_override: data,
                    }))
                    .exhaustive(),
                },
              }
            }
            return feature
          }),
        },
      })

      // closeModal()
    } catch (error) {
      console.error(error)
    }
  })

  const daysOptions = Object.keys(WeekdayEnum).map((key) => ({
    label: upperCaseFirstLetter(key),
    value: key,
  }))

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title="Nodepool stable"
        description="Used for single instances and internal Qovery applications, such as containerized databases, to maintain stability."
        onSubmit={onSubmit}
        onClose={closeModal}
        submitLabel="Save"
        loading={isLoadingEditCluster}
      >
        <div className="mb-6 flex flex-col gap-4 rounded border border-neutral-250 bg-neutral-100 p-4">
          <div className="flex justify-between">
            <p className="text-sm font-medium text-neutral-400">Nodepool resources limits</p>
            <Tooltip
              classNameContent="w-80"
              content="This section is dedicated to configuring the CPU and memory limits for the NodePool. Nodes can be deployed within these limits, ensuring that their total resources do not exceed the defined maximum. This configuration helps prevent unlimited resource allocation, avoiding excessive costs."
            >
              <span className="text-neutral-400">
                <Icon iconName="circle-info" iconStyle="regular" />
              </span>
            </Tooltip>
          </div>
          <Controller
            name="limits.max_cpu_in_vcpu"
            control={methods.control}
            rules={{
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
            name="limits.max_memory_in_gibibytes"
            control={methods.control}
            rules={{
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
                name="consolidation.enabled"
                control={methods.control}
                render={({ field }) => (
                  <InputToggle
                    value={field.value}
                    onChange={field.onChange}
                    title="Consolidation schedule"
                    description="Define when consolidation occurs to optimize resource usage by reducing the number of active nodes."
                    forceAlignTop
                    small
                  />
                )}
              />
              {watchConsolidation && (
                <div className="ml-11 flex flex-col gap-4">
                  <Callout.Root className="items-center" color="yellow">
                    <Callout.Icon>
                      <Icon iconName="info-circle" iconStyle="regular" />
                    </Callout.Icon>
                    <Callout.Text>Some downtime may occur during this process.</Callout.Text>
                  </Callout.Root>
                  <Controller
                    name="consolidation.start_time"
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
                    name="consolidation.duration"
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
                    name="consolidation.days"
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
