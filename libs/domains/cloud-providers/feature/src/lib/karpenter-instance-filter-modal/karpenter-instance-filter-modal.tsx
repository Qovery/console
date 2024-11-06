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
import { Callout, Checkbox, Icon, InputSelect, LoaderSpinner, ModalCrud, Slider } from '@qovery/shared/ui'
import { pluralize } from '@qovery/shared/util-js'
import { useCloudProviderInstanceTypes } from '../hooks/use-cloud-provider-instance-types/use-cloud-provider-instance-types'
import { filterInstancesByKarpenterRequirements } from '../karpenter-instance-filter-modal/utils/filter-instances-by-karpenter-requirements'
import { generateDefaultValues } from '../karpenter-instance-filter-modal/utils/generate-default-values'
import { InstanceCategory } from './instance-category/instance-category'

const DISPLAY_LIMIT = 70
const DEBOUNCE_TIME = 500

const isNumberInRange = (num: number, [min, max]: [number, number]) => num >= min && num <= max

export const getMaxValue = (
  instances: ClusterInstanceTypeResponseListResultsInner[],
  key: 'cpu' | 'ram_in_gb'
): number => {
  return instances.reduce((acc, instance) => Math.max(acc, instance[key]), 0)
}

export const getFilteredInstances = (
  instances: ClusterInstanceTypeResponseListResultsInner[],
  filters: {
    AMD64: boolean
    ARM64: boolean
    cpu: [number, number]
    memory: [number, number]
    categories: Record<string, string[]>
    sizes: string[]
  }
) => {
  return instances.filter((instanceType) => {
    const architectureMatch =
      (filters.AMD64 && instanceType.architecture === 'AMD64') ||
      (filters.ARM64 && instanceType.architecture === 'ARM64')

    const cpuMatch = isNumberInRange(instanceType.cpu, filters.cpu)
    const memoryMatch = isNumberInRange(instanceType.ram_in_gb, filters.memory)

    const categoriesMatch = () => {
      if (!filters.categories || Object.keys(filters.categories).length === 0) return false
      const instanceCategory = instanceType.attributes?.instance_category
      const instanceFamily = instanceType.attributes?.instance_family
      if (!instanceCategory || !instanceFamily) return false
      return filters.categories[instanceCategory]?.includes(instanceFamily)
    }

    const sizeMatch = filters.sizes.includes(instanceType.attributes?.instance_size ?? '')

    return architectureMatch && cpuMatch && memoryMatch && sizeMatch && categoriesMatch()
  })
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

  const debounceCpu = useDebounce(watchCpu, DEBOUNCE_TIME)
  const debounceMemory = useDebounce(watchMemory, DEBOUNCE_TIME)

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
      if (
        (architecture === 'AMD64' && !watchAMD64) ||
        (architecture === 'ARM64' && !watchARM64) ||
        !isNumberInRange(instanceType.cpu, debounceCpu) ||
        !isNumberInRange(instanceType.ram_in_gb, debounceMemory)
      )
        return

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
  }, [cloudProviderInstanceTypes, watchAMD64, watchARM64, debounceCpu, debounceMemory])

  console.log(instanceSizes)

  methods.watch((data) => {
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

    setDataFiltered(filtered)
  })

  const onSubmit = useCallback(
    methods.handleSubmit(({ ARM64, AMD64, default_service_architecture }) => {
      const instanceSize = dataFiltered
        .map((instanceType) => instanceType.attributes?.instance_size ?? '')
        .filter(Boolean)
      const instanceFamily = dataFiltered
        .map((instanceType) => instanceType.attributes?.instance_family ?? '')
        .filter(Boolean)

      onChange({
        default_service_architecture,
        qovery_node_pools: {
          requirements: [
            { key: 'InstanceSize', operator: 'In', values: instanceSize },
            { key: 'InstanceFamily', operator: 'In', values: instanceFamily },
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
          <div className="flex max-h-[64vh] w-1/2 flex-col gap-2 overflow-y-scroll p-2">
            <div className="flex flex-col gap-4 rounded border border-neutral-200 bg-neutral-100 p-4">
              <span className="font-semibold text-neutral-400">Architecture</span>
              <div className="flex flex-col gap-1">
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
                          onCheckedChange={field.onChange}
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
                          onCheckedChange={field.onChange}
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
                    hint="Applications will be built and deployed on this architecture"
                  />
                )}
              />
            </div>
            {(watchAMD64 || watchARM64) && (
              <>
                <div className="flex flex-col gap-4 rounded border border-neutral-200 bg-neutral-100 p-4">
                  <span className="font-semibold text-neutral-400">Resources</span>
                  <div>
                    <Controller
                      name="cpu"
                      control={methods.control}
                      render={({ field }) => (
                        <div className="flex w-full flex-col">
                          <p className="mb-3 text-sm font-medium text-neutral-400">{`CPU min ${watchCpu[0]} - max ${watchCpu[1]}`}</p>
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
                          <p className="mb-3 text-sm font-medium text-neutral-400">{`Memory min ${watchMemory[0]} - max ${watchMemory[1]}`}</p>
                          <Slider onChange={field.onChange} value={field.value} max={maxMemory} min={1} step={1} />
                        </div>
                      )}
                    />
                  </div>
                </div>
                {instanceSizes.length > 0 && (
                  <div className="flex flex-col gap-4 rounded border border-neutral-200 bg-neutral-100 p-4">
                    <span className="font-semibold text-neutral-400">Size</span>
                    <div className="grid grid-cols-2 gap-1">
                      {instanceSizes?.map((size) => (
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
                                    const newSizes = checked
                                      ? [...field.value, size]
                                      : field.value.filter((s) => s !== size)
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
                )}
                {allCategories.length > 0 && (
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
                )}
              </>
            )}
          </div>
          <div className="flex w-1/2 flex-col gap-4 border-l border-neutral-200 p-6">
            <span className="font-semibold text-neutral-400">Selected type instances: {dataFiltered.length}</span>
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
      <div className="flex h-[80vh] w-full items-center justify-center">
        <LoaderSpinner />
      </div>
    )
  }
}

export default KarpenterInstanceFilterModal
