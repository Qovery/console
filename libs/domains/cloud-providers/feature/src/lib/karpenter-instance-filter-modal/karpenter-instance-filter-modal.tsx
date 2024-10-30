import * as Collapsible from '@radix-ui/react-collapsible'
import {
  CloudProviderEnum,
  type ClusterInstanceAttributes,
  type ClusterInstanceTypeResponseListResultsInner,
  CpuArchitectureEnum,
} from 'qovery-typescript-axios'
import { useState } from 'react'
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form'
import { match } from 'ts-pattern'
import { Callout, Checkbox, Icon, InputSelect, ModalCrud, Slider } from '@qovery/shared/ui'
import { useCloudProviderInstanceTypes } from '../..'

export interface KarpenterInstanceFilterModalProps {
  cloudProvider: CloudProviderEnum
  clusterRegion: string
  onClose: () => void
}

function InstanceCategory({ title, attributes }: { title: string; attributes: ClusterInstanceAttributes[] }) {
  const [open, setOpen] = useState(false)
  const { control, watch, setValue } = useFormContext<{ ['categories']: string[] }>()

  const watchCategories = watch('categories')

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen} asChild>
      <div className="flex flex-col">
        <Collapsible.Trigger asChild>
          <button type="button" className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <Checkbox
                id={title}
                name={title}
                className="shrink-0"
                checked={
                  attributes.length === watchCategories.length
                    ? true
                    : watchCategories.length > 0
                      ? 'indeterminate'
                      : false
                }
                onCheckedChange={(checked) => {
                  if (checked) {
                    const allCategories = attributes.filter((a) => a.instance_family)
                    console.log(allCategories)
                    // setValue('categories', allCategories)
                  }
                }}
              />
              <label htmlFor={title} className="text-neutral-400">
                {title.toUpperCase()} - ARM Optimized
              </label>
            </div>
            <Icon className="text-sm text-neutral-350" iconName={open ? 'chevron-up' : 'chevron-down'} />
          </button>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <div className="flex flex-col">
            {attributes.map((attribute) => {
              const instanceFamily = attribute.instance_family
              if (!instanceFamily) return null

              return (
                <div className="flex items-center gap-3 py-1 pl-6">
                  <Controller
                    name="categories"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Checkbox
                          className="shrink-0"
                          name={field.name}
                          id={field.name}
                          checked={field.value.includes(instanceFamily)}
                          onCheckedChange={(checked) => {
                            const newFamily = checked
                              ? [...field.value, attribute.instance_family]
                              : field.value.filter((s) => s !== attribute.instance_family)
                            field.onChange(newFamily)
                          }}
                        />
                        <label htmlFor={attribute.instance_family}>{attribute.instance_family}</label>
                      </>
                    )}
                  />
                </div>
              )
            })}
          </div>
        </Collapsible.Content>
      </div>
    </Collapsible.Root>
  )
}

export function KarpenterInstanceFilterModal({
  cloudProvider,
  clusterRegion,
  onClose,
}: KarpenterInstanceFilterModalProps) {
  // Get instance types only available for AWS
  const { data: cloudProviderInstanceTypes } = useCloudProviderInstanceTypes(
    match(cloudProvider)
      .with('AWS', (cloudProvider) => ({
        cloudProvider,
        clusterType: 'MANAGED' as const,
        region: clusterRegion,
      }))
      .with('SCW', (cloudProvider) => ({
        cloudProvider,
        clusterType: 'MANAGED' as const,
        region: clusterRegion,
      }))
      .with('GCP', (cloudProvider) => ({
        cloudProvider,
        clusterType: 'MANAGED' as const,
      }))
      .with('ON_PREMISE', (cloudProvider) => ({
        cloudProvider,
        clusterType: 'MANAGED' as const,
      }))
      .exhaustive()
  )

  const [dataFiltered, setDataFiltered] = useState<ClusterInstanceTypeResponseListResultsInner[]>([])

  const methods = useForm<{
    ARM64: boolean
    AMD64: boolean
    default_service_architecture: CpuArchitectureEnum
    cpu: [number, number]
    memory: [number, number]
    categories: string[]
    sizes: string[]
  }>({
    mode: 'onChange',
    defaultValues: {
      ARM64: true,
      AMD64: false,
      default_service_architecture: 'AMD64',
      cpu: [1, 8],
      memory: [1, 8],
      categories: [],
      sizes: ['large', 'medium'],
    },
  })

  const getMaxCpu =
    cloudProviderInstanceTypes?.reduce<number>((acc, instanceType) => {
      if (instanceType.cpu > acc) return instanceType.cpu
      return acc
    }, 0) ?? 0

  const getMaxMemory =
    cloudProviderInstanceTypes?.reduce<number>((acc, instanceType) => {
      if (instanceType.cpu > acc) return instanceType.ram_in_gb
      return acc
    }, 0) ?? 0

  const getInstanceSizes = cloudProviderInstanceTypes?.reduce<string[]>((acc, instanceType) => {
    const size = instanceType.attributes?.instance_size
    if (!size) return acc
    if (!acc.includes(size)) acc.push(size)
    return acc
  }, [])

  const getInstanceCategories = cloudProviderInstanceTypes?.reduce<{
    [key: string]: ClusterInstanceAttributes[]
  }>((acc, instanceType) => {
    const attributes = instanceType.attributes
    const category = attributes?.instance_category

    if (!category || !attributes) return acc
    if (!acc[category]) acc[category] = []

    const exists = acc[category].some((attr) => attr.instance_family === attributes.instance_family)
    if (!exists) acc[category].push(attributes)

    return acc
  }, {})

  methods.watch((data) => {
    if (!data || !cloudProviderInstanceTypes) return

    const filtered = cloudProviderInstanceTypes.filter((instanceType) => {
      // Architecture check
      const architectureMatch =
        (data.AMD64 && instanceType.architecture === 'AMD64') ||
        (data.ARM64 && instanceType.architecture === 'ARM64') ||
        (!data.AMD64 && !data.ARM64) // If none selected, show all

      // CPU range check
      const cpuMatch =
        data.cpu && instanceType.cpu >= (data.cpu[0] ?? 0) && instanceType.cpu <= (data.cpu[1] ?? getMaxCpu)

      // Memory range check
      const memoryMatch =
        data.memory &&
        instanceType.ram_in_gb >= (data.memory[0] ?? 0) &&
        instanceType.ram_in_gb <= (data.memory[1] ?? getMaxMemory)

      // Categories check
      const categoriesMatch = data.categories && data.categories.includes(instanceType.attributes?.instance_family)

      // Sizes range check
      const sizeMatch = data.sizes && data.sizes.includes(instanceType.attributes?.instance_size)

      return architectureMatch && cpuMatch && memoryMatch && sizeMatch && categoriesMatch
    })

    setDataFiltered(filtered)
  })

  const onSubmit = methods.handleSubmit(({ sizes }) => {
    return onClose()
  })

  const watchCpu = methods.watch('cpu')
  const watchMemory = methods.watch('memory')

  return (
    <FormProvider {...methods}>
      <ModalCrud title="Karpenter Instance Visual filter" onClose={onClose} onSubmit={onSubmit} submitLabel="Confirm">
        <div className="flex rounded-md border border-neutral-200">
          <div className="flex w-1/2 flex-col gap-2 p-2">
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
            <div className="flex flex-col gap-4 rounded border border-neutral-200 bg-neutral-100 p-4">
              <span className="font-semibold text-neutral-400">Resources</span>
              <div>
                <Controller
                  name="cpu"
                  control={methods.control}
                  render={({ field }) => (
                    <div className="flex w-full flex-col">
                      <p className="mb-3 text-sm font-medium text-neutral-400">{`CPU min ${watchCpu[0]} - max ${watchCpu[1]}`}</p>
                      <Slider onChange={field.onChange} value={field.value} max={getMaxCpu} min={1} step={1} />
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
                      <Slider onChange={field.onChange} value={field.value} max={getMaxMemory} min={1} step={1} />
                    </div>
                  )}
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 rounded border border-neutral-200 bg-neutral-100 p-4">
              <span className="font-semibold text-neutral-400">Categories/Families</span>
              <div>
                {getInstanceCategories &&
                  Object.entries(getInstanceCategories).map(([category, families]) => {
                    return <InstanceCategory key={category} title={category} attributes={families} />
                  })}
              </div>
            </div>
            <div className="flex flex-col gap-4 rounded border border-neutral-200 bg-neutral-100 p-4">
              <span className="font-semibold text-neutral-400">Size</span>
              <div className="grid grid-cols-2 gap-1">
                {getInstanceSizes?.map((size) => (
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
          </div>
          <div className="flex w-1/2 flex-col gap-4 border-l border-neutral-200 p-6">
            <span className="font-semibold text-neutral-400">Selected type instances: {dataFiltered.length}</span>
            <div className="flex flex-wrap text-neutral-400">
              {dataFiltered.map((instanceType, index) => (
                <span key={instanceType.name} className="mr-1 inline-block last:mr-0">
                  {instanceType.name}
                  {dataFiltered.length - 1 !== index ? ', ' : ' '}
                </span>
              ))}
            </div>
            <Callout.Root color="yellow">
              <Callout.Icon>
                <Icon iconName="info-circle" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text>
                <Callout.TextHeading>Warning</Callout.TextHeading>
                <Callout.TextDescription>
                  To install Qovery, at least one of the selected instance types must meet the minimum requirements of 2
                  CPUs and 2 GB of memory. Currently, none of them do. Please select at least one instance type that
                  satisfies these criteria.
                </Callout.TextDescription>
              </Callout.Text>
            </Callout.Root>
          </div>
        </div>
      </ModalCrud>
    </FormProvider>
  )
}

export default KarpenterInstanceFilterModal
