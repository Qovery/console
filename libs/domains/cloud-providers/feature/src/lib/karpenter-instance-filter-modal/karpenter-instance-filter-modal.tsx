import {
  type Cluster,
  type ClusterFeatureKarpenterParametersResponse,
  type ClusterInstanceAttributes,
  type ClusterInstanceTypeResponseListResultsInner,
  CpuArchitectureEnum,
} from 'qovery-typescript-axios'
import { useCallback, useMemo, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { type KarpenterData } from '@qovery/shared/interfaces'
import {
  Callout,
  Checkbox,
  Icon,
  InputSelect,
  LoaderSpinner,
  ModalCrud,
  Tooltip,
  linkVariants,
} from '@qovery/shared/ui'
import { pluralize, twMerge } from '@qovery/shared/util-js'
import { useCloudProviderInstanceTypesKarpenter } from '../hooks/use-cloud-provider-instance-types-karpenter/use-cloud-provider-instance-types-karpenter'
import { filterInstancesByKarpenterRequirements } from '../karpenter-instance-filter-modal/utils/filter-instances-by-karpenter-requirements'
import { generateDefaultValues } from '../karpenter-instance-filter-modal/utils/generate-default-values'
import { type ClusterInstanceAttributesExtended, InstanceCategory } from './instance-category/instance-category'
import { sortInstanceSizes } from './utils/sort-instance-sizes'

const DISPLAY_LIMIT = 60

export interface KarpenterInstanceFilterModalProps {
  clusterRegion: string
  cloudProviderInstanceTypes: ClusterInstanceTypeResponseListResultsInner[]
  onChange: (data: Omit<KarpenterData, 'disk_size_in_gib' | 'enabled' | 'spot_enabled'>) => void
  onClose: () => void
  defaultValues?: Omit<KarpenterData, 'disk_size_in_gib' | 'enabled' | 'spot_enabled'>
  cluster?: Cluster
}

export interface KarpenterInstanceFormProps {
  ARM64: boolean
  AMD64: boolean
  default_service_architecture: CpuArchitectureEnum
  categories: Record<string, string[]>
  sizes: string[]
}

function KarpenterInstanceForm({
  cloudProviderInstanceTypes,
  defaultValues,
  onChange,
  onClose,
  cluster,
}: Omit<KarpenterInstanceFilterModalProps, 'clusterRegion'>) {
  const _defaultValues = defaultValues
    ? filterInstancesByKarpenterRequirements(cloudProviderInstanceTypes, defaultValues)
    : cloudProviderInstanceTypes

  const [dataFiltered, setDataFiltered] = useState<ClusterInstanceTypeResponseListResultsInner[]>(_defaultValues)
  const [extendSelection, setExtendSelection] = useState(false)
  const [showArchitectureWarning, setShowArchitectureWarning] = useState(false)

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

  const watchAMD64 = methods.watch('AMD64')
  const watchARM64 = methods.watch('ARM64')
  const watchSizes = methods.watch('sizes')
  const watchCategories = methods.watch('categories')

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
          (attr) =>
            attr.instance_family === attributes.instance_family && attr.instance_size === attributes.instance_size
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
  methods.watch((data) => {
    if (!data || !cloudProviderInstanceTypes) return
    const filtered = cloudProviderInstanceTypes.filter((instanceType) => {
      // Architecture check
      const architectureMatch =
        (data.AMD64 && instanceType.architecture === 'AMD64') || (data.ARM64 && instanceType.architecture === 'ARM64')
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
      return architectureMatch && sizeMatch && categoriesMatch()
    })
    setDataFiltered(filtered)
  })

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

  const selectAllSizes = () => {
    methods.setValue('sizes', instanceSizes)
  }

  const unselectAllSizes = () => {
    methods.setValue('sizes', [])
  }

  const selectAllCategories = () => {
    const allCategories: Record<string, string[]> = {}

    cloudProviderInstanceTypes.forEach((instanceType) => {
      const category = instanceType.attributes?.instance_category
      const family = instanceType.attributes?.instance_family

      if (category && family) {
        if (!allCategories[category]) {
          allCategories[category] = []
        }
        if (!allCategories[category].includes(family)) {
          allCategories[category].push(family)
        }
      }
    })

    methods.setValue('categories', allCategories)
  }

  const unselectAllCategories = () => {
    methods.setValue('categories', {})
  }

  const allCategories = [
    ...new Set(Object.values(instanceCategories).flatMap((architecture) => Object.keys(architecture))),
  ]

  const getDefaultArchitecture = () => {
    const karpenterFeature = cluster?.features?.find(
      (feature) => feature.id === 'KARPENTER'
    ) as ClusterFeatureKarpenterParametersResponse

    if (karpenterFeature) {
      return karpenterFeature.value.default_service_architecture
    }

    return null
  }

  return (
    <FormProvider {...methods}>
      <ModalCrud title="Karpenter Instance Visual filter" onClose={onClose} onSubmit={onSubmit} submitLabel="Confirm">
        <div className="flex rounded-md border border-neutral-200">
          <div className="flex max-h-[60vh] w-1/2 flex-col gap-2 overflow-y-scroll p-2">
            <div className="flex flex-col gap-4 rounded border border-neutral-200 bg-neutral-100 p-4">
              <span className="flex w-full justify-between font-semibold text-neutral-400">Architecture</span>
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
                              const clusterArchitecture = getDefaultArchitecture()
                              setShowArchitectureWarning('ARM64' !== clusterArchitecture)
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
                              const clusterArchitecture = getDefaultArchitecture()
                              setShowArchitectureWarning('AMD64' !== clusterArchitecture)
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
                    onChange={(value) => {
                      field.onChange(value)
                      if (cluster) {
                        const clusterArchitecture = getDefaultArchitecture()
                        setShowArchitectureWarning(value !== clusterArchitecture)
                      }
                    }}
                    value={field.value}
                    disabled={!watchAMD64 || !watchARM64}
                    hint="Applications will be built and deployed on this architecture"
                  />
                )}
              />
              {showArchitectureWarning && (
                <Callout.Root color="yellow">
                  <Callout.Icon>
                    <Icon iconName="info-circle" iconStyle="regular" />
                  </Callout.Icon>
                  <Callout.Text>
                    <Callout.TextHeading>Warning</Callout.TextHeading>
                    <Callout.TextDescription>
                      Please note that if you change your default build architecture, you will need to redeploy all
                      applications to ensure they are built in the new architecture.
                    </Callout.TextDescription>
                  </Callout.Text>
                </Callout.Root>
              )}
            </div>
            <div className="flex flex-col gap-4 rounded border border-neutral-200 bg-neutral-100 p-4">
              <div className="flex w-full justify-between font-semibold text-neutral-400">
                Size
                <div className="flex gap-0.5">
                  {watchSizes.length === 0 ? (
                    <button
                      type="button"
                      onClick={selectAllSizes}
                      className={twMerge(
                        linkVariants({ color: 'brand', size: 'sm', underline: true }),
                        'font-semibold'
                      )}
                    >
                      Select all
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={unselectAllSizes}
                      className={twMerge(
                        linkVariants({ color: 'brand', size: 'sm', underline: true }),
                        'font-semibold'
                      )}
                    >
                      Unselect all
                    </button>
                  )}
                </div>
              </div>
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
              <div className="flex w-full justify-between font-semibold text-neutral-400">
                Categories/Families
                <div className="flex gap-0.5">
                  {Object.keys(watchCategories).length === 0 ? (
                    <button
                      type="button"
                      onClick={selectAllCategories}
                      className={twMerge(
                        linkVariants({ color: 'brand', size: 'sm', underline: true }),
                        'font-semibold'
                      )}
                    >
                      Select all
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={unselectAllCategories}
                      className={twMerge(
                        linkVariants({ color: 'brand', size: 'sm', underline: true }),
                        'font-semibold'
                      )}
                    >
                      Unselect all
                    </button>
                  )}
                </div>
              </div>
              <div>
                {allCategories
                  .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
                  .map((category) => {
                    const allSizes = Array.from(
                      new Set(
                        Object.values(instanceCategories)
                          .flatMap((categories) => categories[category] || [])
                          .filter((attr) => attr.instance_size)
                          .map((attr) => attr.instance_size!)
                      )
                    ).sort()

                    // Group attributes by instance_family
                    const groupedAttributes = Object.entries(instanceCategories)
                      .flatMap(([architecture, categories]) =>
                        (categories[category] || []).map((attr) => ({
                          ...attr,
                          architecture: architecture as CpuArchitectureEnum,
                          sizes: allSizes,
                        }))
                      )
                      .reduce(
                        (acc, curr) => {
                          const key = curr.instance_family || ''
                          if (!acc[key]) {
                            acc[key] = {
                              ...curr,
                              // Keep track of all architectures that support this family
                              architectures: [curr.architecture],
                            }
                          } else {
                            // If this architecture isn't already tracked, add it
                            if (!acc[key].architectures.includes(curr.architecture)) {
                              acc[key].architectures.push(curr.architecture)
                            }
                          }
                          return acc
                        },
                        {} as Record<
                          string,
                          ClusterInstanceAttributesExtended & { architectures: CpuArchitectureEnum[] }
                        >
                      )

                    // Convert back to array
                    const mergedAttributes = Object.values(groupedAttributes)

                    if (mergedAttributes.length === 0) return null
                    return <InstanceCategory key={category} title={category} attributes={mergedAttributes} />
                  })}
              </div>
            </div>
          </div>
          <div className="flex max-h-[60vh] w-1/2 flex-col gap-4 overflow-y-scroll border-l border-neutral-200 p-6">
            <div className="flex w-full items-center justify-between">
              <span className="font-semibold text-neutral-400">Selected instance types: {dataFiltered.length}</span>
              <Tooltip
                classNameContent="max-w-80"
                content="Karpenter will create nodes based on the specified list of instance types. By selecting specific instance types, you can control the performance, cost, and architecture of the nodes in your cluster."
              >
                <span className="text-neutral-400">
                  <Icon iconName="info-circle" iconStyle="regular" />
                </span>
              </Tooltip>
            </div>
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
            {dataFiltered.length > 0 && (
              <div className="flex flex-wrap text-neutral-400">
                {(!extendSelection ? dataFiltered.slice(0, DISPLAY_LIMIT) : dataFiltered).map((instanceType, index) => (
                  <span key={instanceType.name} className="mr-1 inline-block last:mr-0">
                    {instanceType.name}
                    {index < dataFiltered.length - 1 ? ', ' : ' '}
                  </span>
                ))}
                {!extendSelection && dataFiltered.length > DISPLAY_LIMIT && (
                  <span>
                    and{' '}
                    <button
                      className={twMerge(
                        linkVariants({ color: 'sky', size: 'sm', underline: true }),
                        'inline text-base font-normal'
                      )}
                      type="button"
                      onClick={() => setExtendSelection(true)}
                    >
                      {dataFiltered.length - DISPLAY_LIMIT}{' '}
                      {pluralize(dataFiltered.length - DISPLAY_LIMIT, 'other', 'others')}
                    </button>
                  </span>
                )}
                {extendSelection && (
                  <button
                    type="button"
                    className={twMerge(
                      linkVariants({ color: 'sky', size: 'sm', underline: true }),
                      'text-base font-normal'
                    )}
                    onClick={() => setExtendSelection(false)}
                  >
                    less
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </ModalCrud>
    </FormProvider>
  )
}

export function KarpenterInstanceFilterModal({
  clusterRegion,
  defaultValues,
  onChange,
  onClose,
  cluster,
}: Omit<KarpenterInstanceFilterModalProps, 'cloudProviderInstanceTypes'>) {
  // Get instance types only available for AWS
  const { data: cloudProviderInstanceTypesKarpenter } = useCloudProviderInstanceTypesKarpenter({
    region: clusterRegion,
    enabled: true,
  })

  if (cloudProviderInstanceTypesKarpenter) {
    return (
      <KarpenterInstanceForm
        defaultValues={defaultValues}
        cloudProviderInstanceTypes={cloudProviderInstanceTypesKarpenter}
        onChange={onChange}
        onClose={onClose}
        cluster={cluster}
      />
    )
  } else {
    return (
      <div className="flex h-[75vh] w-full items-center justify-center p-5">
        <LoaderSpinner />
      </div>
    )
  }
}

export default KarpenterInstanceFilterModal
