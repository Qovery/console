import { useDebounce } from '@uidotdev/usehooks'
import {
  type CloudProviderEnum,
  type ClusterInstanceAttributes,
  type ClusterInstanceTypeResponseListResultsInner,
  CpuArchitectureEnum,
} from 'qovery-typescript-axios'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import { type KarpenterData } from '@qovery/shared/interfaces'
import { Callout, Checkbox, Icon, InputSelect, LoaderSpinner, ModalCrud, Slider, Tooltip } from '@qovery/shared/ui'
import { pluralize } from '@qovery/shared/util-js'
import { useCloudProviderInstanceTypes } from '../hooks/use-cloud-provider-instance-types/use-cloud-provider-instance-types'
import { filterInstancesByKarpenterRequirements } from '../karpenter-instance-filter-modal/utils/filter-instances-by-karpenter-requirements'
import { generateDefaultValues } from '../karpenter-instance-filter-modal/utils/generate-default-values'
import { InstanceCategory } from './instance-category/instance-category'
import { sortInstanceSizes } from './utils/sort-instance-sizes'

const DISPLAY_LIMIT = 60
// const DEBOUNCE_TIME = 300

const isNumberInRange = (num: number, [min, max]: [number, number]) => num >= min && num <= max

export const getMaxValue = (
  instances: ClusterInstanceTypeResponseListResultsInner[],
  key: 'cpu' | 'ram_in_gb'
): number => {
  return instances.reduce((acc, instance) => Math.max(acc, instance[key]), 0)
}

export interface KarpenterInstanceFilterModalProps {
  cloudProvider: CloudProviderEnum
  clusterRegion: string
  cloudProviderInstanceTypes: ClusterInstanceTypeResponseListResultsInner[]
  onChange: (data: Omit<KarpenterData, 'disk_size_in_gib' | 'enabled' | 'spot_enabled'>) => void
  onClose: () => void
  defaultValues?: Omit<KarpenterData, 'disk_size_in_gib' | 'enabled' | 'spot_enabled'>
}

export interface KarpenterInstanceFormProps {
  ARM64: boolean
  AMD64: boolean
  default_service_architecture: CpuArchitectureEnum
  cpu: [number, number]
  memory: [number, number]
  categories: Record<string, string[]>
  sizes: string[]
}

function KarpenterInstanceForm({
  cloudProviderInstanceTypes,
  defaultValues,
  onChange,
  onClose,
}: Omit<KarpenterInstanceFilterModalProps, 'cloudProvider' | 'clusterRegion'>) {
  const _defaultValues = defaultValues
    ? filterInstancesByKarpenterRequirements(cloudProviderInstanceTypes, defaultValues)
    : cloudProviderInstanceTypes

  const [dataFiltered, setDataFiltered] = useState<ClusterInstanceTypeResponseListResultsInner[]>(_defaultValues)

  const methods = useForm<KarpenterInstanceFormProps>({
    mode: 'onChange',
    defaultValues: {
      default_service_architecture: defaultValues?.default_service_architecture ?? 'AMD64',
      ...generateDefaultValues(_defaultValues),
    },
    resolver: async (values) => {
      if (!values.AMD64 && !values.ARM64) {
        return {
          values,
          errors: {
            type: 'error',
            message: 'Please select at least one architecture.',
          },
        }
      }

      if (dataFiltered.length === 0) {
        return {
          values,
          errors: {
            type: 'error',
            message: 'Please select at least one instance type.',
          },
        }
      }

      return {
        values,
        errors: {},
      }
    },
  })

  const watchCpu = methods.watch('cpu')
  const watchMemory = methods.watch('memory')
  const watchAMD64 = methods.watch('AMD64')
  const watchARM64 = methods.watch('ARM64')

  // const debounceCpu = useDebounce(watchCpu, DEBOUNCE_TIME)
  // const debounceMemory = useDebounce(watchMemory, DEBOUNCE_TIME)

  const maxCpu = useMemo(() => getMaxValue(cloudProviderInstanceTypes, 'cpu'), [cloudProviderInstanceTypes])
  const maxMemory = useMemo(() => getMaxValue(cloudProviderInstanceTypes, 'ram_in_gb'), [cloudProviderInstanceTypes])

  const { instanceSizes, instanceCategories } = useMemo(() => {
    const sizes = new Set<string>()
    const categories: {
      [architecture: string]: {
        [category: string]: ClusterInstanceAttributes[]
      }
    } = {}

    cloudProviderInstanceTypes.forEach((instanceType) => {
      const { attributes, architecture } = instanceType
      if (!attributes?.instance_size || !architecture) return
      sizes.add(attributes.instance_size)

      const category = attributes.instance_category
      if (category) {
        if (!categories[architecture]) categories[architecture] = {}
        if (!categories[architecture][category]) categories[architecture][category] = []

        const exists = categories[architecture][category].some(
          (attr) => attr.instance_family === attributes.instance_family
        )

        if (!exists) {
          categories[architecture][category].push(attributes)
        }
      }
    })

    return {
      instanceSizes: Array.from(sizes),
      instanceCategories: categories,
    }
  }, [cloudProviderInstanceTypes])

  // Defined data filtered
  useEffect(() => {
    const subscription = methods.watch((data) => {
      if (!data || !cloudProviderInstanceTypes) return

      const filtered = cloudProviderInstanceTypes.filter((instanceType) => {
        // Architecture check
        const architectureMatch =
          (data.AMD64 && instanceType.architecture === 'AMD64') || (data.ARM64 && instanceType.architecture === 'ARM64')

        // CPU range check
        const cpuMatch = data.cpu && isNumberInRange(instanceType.cpu, data.cpu as [number, number])

        // Memory range check
        const memoryMatch = data.memory && isNumberInRange(instanceType.ram_in_gb, data.memory as [number, number])

        // Categories check
        const categoriesMatch = () => {
          if (!data.categories || Object.keys(data.categories).length === 0) return false
          const instanceCategory = instanceType.attributes?.instance_category
          const instanceFamily = instanceType.attributes?.instance_family

          if (!instanceCategory || !instanceFamily) return false

          const hashmap = new Map(Object.entries(data.categories))

          return hashmap.get(instanceCategory)?.includes(instanceFamily)
        }

        // Sizes range check
        const sizeMatch = data.sizes && data.sizes.includes(instanceType.attributes?.instance_size)

        return architectureMatch && cpuMatch && memoryMatch && sizeMatch && categoriesMatch()
      })

      setDataFiltered((previousData) =>
        JSON.stringify(previousData) !== JSON.stringify(filtered) ? filtered : previousData
      )
    })
    return () => subscription.unsubscribe()
  }, [methods])

  useEffect(() => {
    const values = generateDefaultValues(dataFiltered)
    // Set all news values based on the filtered data
    // We can't use `methods.reset` because it provides infinite loop
    methods.setValue('AMD64', values.AMD64)
    methods.setValue('ARM64', values.ARM64)
    methods.setValue('sizes', values.sizes)
    methods.setValue('categories', values.categories)
  }, [dataFiltered, methods])

  const onSubmit = useCallback(
    methods.handleSubmit(({ ARM64, AMD64, default_service_architecture }) => {
      const instanceSize = dataFiltered
        .map((instanceType) => instanceType.attributes?.instance_size)
        .filter((item): item is string => item !== undefined)
      const instanceFamily = dataFiltered
        .map((instanceType) => instanceType.attributes?.instance_family)
        .filter((item): item is string => item !== undefined)

      onChange({
        default_service_architecture,
        qovery_node_pools: {
          requirements: [
            { key: 'InstanceSize', operator: 'In', values: Array.from(new Set(instanceSize)) },
            { key: 'InstanceFamily', operator: 'In', values: Array.from(new Set(instanceFamily)) },
            { key: 'Arch', operator: 'In', values: [ARM64 ? 'ARM64' : '', AMD64 ? 'AMD64' : ''].filter(Boolean) },
          ],
        },
      })

      onClose()
    }),
    [dataFiltered, onChange, onClose]
  )

  const allCategories = [
    ...new Set(Object.values(instanceCategories).flatMap((architecture) => Object.keys(architecture))),
  ]

  return (
    <FormProvider {...methods}>
      <ModalCrud title="Karpenter Instance Visual filter" onClose={onClose} onSubmit={onSubmit} submitLabel="Confirm">
        <div className="flex rounded-md border border-neutral-200">
          <div className="flex max-h-[60vh] w-1/2 flex-col gap-2 overflow-y-scroll p-2">
            <div className="flex flex-col gap-4 rounded border border-neutral-200 bg-neutral-100 p-4">
              <span className="font-semibold text-neutral-400">Architecture</span>
              <div className="grid grid-cols-2 gap-1">
                <div className="flex items-center gap-3">
                  <Controller
                    name="AMD64"
                    control={methods.control}
                    render={({ field }) => (
                      <>
                        <Checkbox
                          className="shrink-0"
                          name={field.name}
                          id={field.name}
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            if (!checked) {
                              methods.setValue('default_service_architecture', 'ARM64')
                            } else {
                              // Reset all other values
                              const values = generateDefaultValues(cloudProviderInstanceTypes)
                              methods.setValue('sizes', values.sizes)
                              methods.setValue('categories', values.categories)
                            }

                            field.onChange(checked)
                          }}
                        />
                        <label htmlFor="AMD64">AMD64</label>
                      </>
                    )}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Controller
                    name="ARM64"
                    control={methods.control}
                    render={({ field }) => (
                      <>
                        <Checkbox
                          className="shrink-0"
                          name={field.name}
                          id={field.name}
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            if (!checked) {
                              methods.setValue('default_service_architecture', 'AMD64')

                              const values = generateDefaultValues(
                                cloudProviderInstanceTypes.filter(
                                  (instanceType) => instanceType.architecture === 'AMD64'
                                )
                              )
                              // methods.setValue(`sizes.${values.}`, values.sizes)
                              // methods.setValue('categories', values.categories)
                            } else {
                              // Reset all other values
                              const values = generateDefaultValues(cloudProviderInstanceTypes)
                              methods.setValue('sizes', values.sizes)
                              methods.setValue('categories', values.categories)
                            }

                            field.onChange(checked)
                          }}
                        />
                        <label htmlFor="ARM64">ARM64</label>
                      </>
                    )}
                  />
                </div>
              </div>
              <Controller
                name="default_service_architecture"
                control={methods.control}
                render={({ field }) => (
                  <InputSelect
                    label="Select build default"
                    options={Object.keys(CpuArchitectureEnum).map((value) => ({ label: value, value }))}
                    onChange={field.onChange}
                    value={field.value}
                    disabled={!watchAMD64 || !watchARM64}
                    hint="Applications will be built and deployed on this architecture"
                  />
                )}
              />
            </div>
            <div className="flex flex-col gap-4 rounded border border-neutral-200 bg-neutral-100 p-4">
              <span className="font-semibold text-neutral-400">Size</span>
              <div className="grid grid-cols-3 gap-1">
                {sortInstanceSizes(instanceSizes)?.map((size) => (
                  <div key={size} className="flex items-center gap-3">
                    <Controller
                      name="sizes"
                      control={methods.control}
                      render={({ field }) => (
                        <>
                          <Checkbox
                            className="shrink-0"
                            name={size}
                            id={size}
                            checked={field.value.includes(size)}
                            onCheckedChange={(checked) => {
                              const newSizes = checked ? [...field.value, size] : field.value.filter((s) => s !== size)
                              field.onChange(newSizes)
                            }}
                          />
                          <label htmlFor={size}>{size}</label>
                        </>
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4 rounded border border-neutral-200 bg-neutral-100 p-4">
              <span className="font-semibold text-neutral-400">Resources</span>
              <div>
                <Controller
                  name="cpu"
                  control={methods.control}
                  render={({ field }) => (
                    <div className="flex w-full flex-col">
                      <p className="mb-3 text-sm font-medium text-neutral-400">{`CPU (vCPUs) min ${watchCpu[0]} - max ${watchCpu[1]}`}</p>
                      <Slider onChange={field.onChange} value={field.value} max={maxCpu} min={1} step={1} />
                    </div>
                  )}
                />
              </div>
              <div>
                <Controller
                  name="memory"
                  control={methods.control}
                  render={({ field }) => (
                    <div className="flex w-full flex-col">
                      <p className="mb-3 text-sm font-medium text-neutral-400">{`Memory (GiB) min ${watchMemory[0]} - max ${watchMemory[1]}`}</p>
                      <Slider onChange={field.onChange} value={field.value} max={maxMemory} min={1} step={1} />
                    </div>
                  )}
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 rounded border border-neutral-200 bg-neutral-100 p-4">
              <span className="font-semibold text-neutral-400">Categories/Families</span>
              <div>
                {allCategories
                  .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
                  .map((category) => {
                    const attributes: ClusterInstanceAttributes[] = Object.values(instanceCategories).flatMap(
                      (architecture) => architecture[category] || []
                    )

                    if (attributes.length === 0) return null
                    return <InstanceCategory key={category} title={category} attributes={attributes} />
                  })}
              </div>
            </div>
          </div>
          <div className="flex w-1/2 flex-col gap-4 border-l border-neutral-200 p-6">
            <div className="flex w-full items-center justify-between">
              <span className="font-semibold text-neutral-400">Selected type instances: {dataFiltered.length}</span>
              <Tooltip
                classNameContent="max-w-80"
                content="Karpenter will create nodes based on the specified list of instance types. By selecting specific instance types, you can control the performance, cost, and architecture of the nodes in your cluster."
              >
                <span className="text-xl text-neutral-400">
                  <Icon iconName="info-circle" iconStyle="regular" />
                </span>
              </Tooltip>
            </div>
            {dataFiltered.length > 0 && (
              <div className="flex flex-wrap text-neutral-400">
                {dataFiltered.slice(0, DISPLAY_LIMIT).map((instanceType, index) => (
                  <span key={instanceType.name} className="mr-1 inline-block last:mr-0">
                    {instanceType.name}
                    {index < DISPLAY_LIMIT - 1 && index !== dataFiltered.length - 1 ? ', ' : ' '}
                  </span>
                ))}
                {dataFiltered.length > DISPLAY_LIMIT && (
                  <span>
                    and {dataFiltered.length - DISPLAY_LIMIT}{' '}
                    {pluralize(dataFiltered.length - DISPLAY_LIMIT, 'other', 'others')}
                  </span>
                )}
              </div>
            )}
            {dataFiltered.filter((instanceType) => instanceType.attributes?.meets_resource_reqs).length === 0 && (
              <Callout.Root color="yellow">
                <Callout.Icon>
                  <Icon iconName="info-circle" iconStyle="regular" />
                </Callout.Icon>
                <Callout.Text>
                  <Callout.TextHeading>Warning</Callout.TextHeading>
                  <Callout.TextDescription>
                    To install Qovery, at least one of the selected instance types must meet the minimum requirements of
                    2 CPUs and 2 GB of memory. Currently, none of them do. Please select at least one instance type that
                    satisfies these criteria.
                  </Callout.TextDescription>
                </Callout.Text>
              </Callout.Root>
            )}
          </div>
        </div>
      </ModalCrud>
    </FormProvider>
  )
}

export function KarpenterInstanceFilterModal({
  cloudProvider,
  clusterRegion,
  defaultValues,
  onChange,
  onClose,
}: Omit<KarpenterInstanceFilterModalProps, 'cloudProviderInstanceTypes'>) {
  // Get instance types only available for AWS
  const { data: cloudProviderInstanceTypes } = useCloudProviderInstanceTypes(
    match(cloudProvider)
      .with('AWS', (cloudProvider) => ({
        cloudProvider,
        clusterType: 'MANAGED' as const,
        region: clusterRegion,
        onlyMeetsResourceReqs: false,
        withCpu: false,
      }))
      .with('SCW', (cloudProvider) => ({
        cloudProvider,
        clusterType: 'MANAGED' as const,
        region: clusterRegion,
        onlyMeetsResourceReqs: false,
      }))
      .with('GCP', (cloudProvider) => ({
        cloudProvider,
        clusterType: 'MANAGED' as const,
        onlyMeetsResourceReqs: false,
      }))
      .with('ON_PREMISE', (cloudProvider) => ({
        cloudProvider,
        clusterType: 'MANAGED' as const,
        onlyMeetsResourceReqs: false,
      }))
      .exhaustive()
  )

  if (cloudProviderInstanceTypes) {
    // Hide GPU instances for Karpenter
    return (
      <KarpenterInstanceForm
        defaultValues={defaultValues}
        cloudProviderInstanceTypes={cloudProviderInstanceTypes}
        onChange={onChange}
        onClose={onClose}
      />
    )
  } else {
    return (
      <div className="flex w-full items-center justify-center">
        <LoaderSpinner />
      </div>
    )
  }
}

export default KarpenterInstanceFilterModal
