import { AnimatePresence, motion } from 'framer-motion'
import { CloudProviderEnum, type Cluster, type CpuArchitectureEnum, KubernetesEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { match } from 'ts-pattern'
import {
  KarpenterInstanceFilterModal,
  KarpenterInstanceTypePreview,
  convertToKarpenterRequirements,
  useCloudProviderInstanceTypes,
  useCloudProviderInstanceTypesKarpenter,
} from '@qovery/domains/cloud-providers/feature'
import { NodepoolsResourcesSettings } from '@qovery/domains/clusters/feature'
import { IconEnum } from '@qovery/shared/enums'
import { type ClusterResourcesData, type Value } from '@qovery/shared/interfaces'
import {
  BlockContent,
  Button,
  Callout,
  ExternalLink,
  Heading,
  Icon,
  InputRadioBox,
  InputSelect,
  InputText,
  InputToggle,
  Section,
  Slider,
  Tooltip,
  useModal,
} from '@qovery/shared/ui'
import { listInstanceTypeFormatter } from '../../feature/cluster-resources-settings-feature/utils/list-instance-type-formatter'
import { ButtonPopoverSubnets } from './button-popover-subnets/button-popover-subnets'
import KarpenterImage from './karpenter-image.svg'

export interface ClusterResourcesSettingsProps {
  cluster?: Cluster
  fromDetail?: boolean
  clusterTypeOptions?: Value[]
  cloudProvider?: CloudProviderEnum
  clusterRegion?: string
  showWarningInstance?: boolean
  hasAlreadyKarpenter?: boolean
  isProduction?: boolean
}

export function ClusterResourcesSettings(props: ClusterResourcesSettingsProps) {
  const { openModal, closeModal } = useModal()
  const { control, watch, setValue } = useFormContext<ClusterResourcesData>()
  const watchNodes = watch('nodes')
  const [warningInstance, setWarningInstance] = useState(false)
  const [warningClusterNodes, setWarningClusterNodes] = useState(false)
  const watchClusterType = watch('cluster_type')
  const watchInstanceType = watch('instance_type')
  const watchKarpenterEnabled = watch('karpenter.enabled')
  const watchKarpenter = watch('karpenter')
  const watchDiskSize = watch('disk_size')
  const watchKarpenterQoveryNodePools = watch('karpenter.qovery_node_pools.requirements')
  const watchSpotEnabled = watch('karpenter.spot_enabled')

  const isKarpenter = Boolean(props.cluster?.features?.find((f) => f.id === 'KARPENTER'))

  const { data: cloudProviderInstanceTypes } = useCloudProviderInstanceTypes(
    match(props.cloudProvider || CloudProviderEnum.AWS)
      .with('AWS', (cloudProvider) => ({
        cloudProvider,
        clusterType: (watchClusterType || 'MANAGED') as (typeof KubernetesEnum)[keyof typeof KubernetesEnum],
        region: props.clusterRegion || '',
      }))
      .with('SCW', (cloudProvider) => ({
        cloudProvider,
        clusterType: 'MANAGED' as const,
        region: props.clusterRegion || '',
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

  const { data: cloudProviderInstanceTypesKarpenter } = useCloudProviderInstanceTypesKarpenter({
    region: props.clusterRegion || '',
    enabled: !props.fromDetail,
  })

  const instanceTypeOptions = listInstanceTypeFormatter(cloudProviderInstanceTypes ?? [])

  useEffect(() => {
    const instanceType: Value | undefined = instanceTypeOptions?.find((option) => option.value === watchInstanceType)
    if (instanceType) {
      setWarningInstance(instanceType.label?.toString().indexOf('ARM') !== -1)
    }
  }, [watchInstanceType])

  // XXX: Hotfix waiting deprecated managed cluster to be removed
  useEffect(() => {
    if (!watchKarpenterEnabled || watchKarpenterQoveryNodePools.length > 0) return

    if (!props.fromDetail) {
      if (cloudProviderInstanceTypesKarpenter && props.cloudProvider === 'AWS') {
        setValue(
          'karpenter.qovery_node_pools.requirements',
          convertToKarpenterRequirements(cloudProviderInstanceTypesKarpenter)
        )
      }
    }
  }, [
    watchKarpenterEnabled,
    watchKarpenterQoveryNodePools,
    props.fromDetail,
    cloudProviderInstanceTypesKarpenter,
    setValue,
    props.cloudProvider,
  ])

  const hasExistingVPC = Boolean(props.cluster?.features?.find((f) => f.id === 'EXISTING_VPC')?.value_object?.value)
  const hasStaticIP = props.cluster?.features?.find((f) => f.id === 'STATIC_IP')?.value_object?.value

  return (
    <div className="flex flex-col gap-10">
      <BlockContent title="Cluster" className="mb-0">
        {!props.fromDetail ? (
          <Controller
            name="cluster_type"
            control={control}
            rules={{
              required: 'Please select a cluster type',
            }}
            render={({ field }) => (
              <div>
                {props.clusterTypeOptions?.map((option) => (
                  <InputRadioBox
                    key={option.value}
                    fieldValue={field.value}
                    onChange={(event) => {
                      setValue('karpenter.enabled', false)
                      field.onChange(event)
                    }}
                    name={field.name}
                    label={option.label}
                    value={option.value}
                    description={option.description}
                  />
                ))}
              </div>
            )}
          />
        ) : (
          <div className="rounded border border-neutral-250 p-4 text-sm text-neutral-400">
            {props.clusterTypeOptions &&
              props.clusterTypeOptions[0] &&
              `${props.clusterTypeOptions[0].label} - ${props.clusterTypeOptions[0].description}`}
          </div>
        )}
      </BlockContent>
      {props.cloudProvider === 'AWS' && watchClusterType === KubernetesEnum.MANAGED && (
        <BlockContent
          title={props.isProduction ? 'Reduce your costs with Karpenter' : 'Karpenter configuration'}
          className="mb-0"
          classNameContent="p-0"
          headRight={
            <Tooltip
              content={
                <span>
                  Karpenter streamlines Kubernetes infrastructure by provisioning the right nodes at the right time.{' '}
                  <br /> These settings will be applied to both the stable and default nodepools
                </span>
              }
              classNameContent="max-w-96"
            >
              <span className="text-sm text-neutral-400">
                <Icon iconName="info-circle" iconStyle="regular" />
              </span>
            </Tooltip>
          }
        >
          <Controller
            name="karpenter.enabled"
            defaultValue={false}
            control={control}
            render={({ field }) => (
              <div className="flex flex-col">
                <div className="relative overflow-hidden">
                  <div className="p-4">
                    {props.isProduction || props.fromDetail ? (
                      <ButtonPopoverSubnets
                        disabled={!props.fromDetail || isKarpenter || (!hasExistingVPC && !hasStaticIP)}
                      >
                        <InputToggle
                          className="max-w-[70%]"
                          name={field.name}
                          value={field.value}
                          onChange={(e) => {
                            if (!props.fromDetail) {
                              if (cloudProviderInstanceTypesKarpenter) {
                                setValue(
                                  'karpenter.qovery_node_pools.requirements',
                                  convertToKarpenterRequirements(cloudProviderInstanceTypesKarpenter)
                                )
                              }
                            } else {
                              const instanceType = cloudProviderInstanceTypes?.filter(
                                (option) => option.name === watchInstanceType
                              )
                              if (instanceType) {
                                setValue(
                                  'karpenter.qovery_node_pools.requirements',
                                  convertToKarpenterRequirements(instanceType)
                                )
                                setValue('karpenter.disk_size_in_gib', watchDiskSize)
                                setValue(
                                  'karpenter.default_service_architecture',
                                  (instanceType[0]?.architecture ?? 'AMD64') as CpuArchitectureEnum
                                )
                              }
                            }
                            field.onChange(e)
                          }}
                          title="Enable Karpenter"
                          description="Karpenter simplifies Kubernetes infrastructure with the right nodes at the right time."
                          forceAlignTop
                          disabled={
                            props.fromDetail ? props.hasAlreadyKarpenter || (!hasExistingVPC && !hasStaticIP) : false
                          }
                          small
                        />
                      </ButtonPopoverSubnets>
                    ) : (
                      <p className="mb-2 max-w-[70%] text-sm text-neutral-400">
                        Karpenter simplifies Kubernetes infrastructure with the right nodes at the right time.
                      </p>
                    )}
                    <ExternalLink
                      className={props.isProduction || props.fromDetail ? 'ml-11' : ''}
                      href="https://hub.qovery.com/docs/using-qovery/configuration/clusters/#managing-your-clusters-with-qovery"
                    >
                      Documentation link
                    </ExternalLink>
                    {!hasExistingVPC && !hasStaticIP && props.fromDetail && (
                      <Callout.Root color="yellow" className="mt-5">
                        <Callout.Icon>
                          <Icon iconName="circle-info" iconStyle="regular" />
                        </Callout.Icon>
                        <Callout.Text>
                          <Callout.TextDescription>
                            Karpenter cannot be enabled on this cluster because the Statc IP/NAT Gateway feature is not
                            activated.
                          </Callout.TextDescription>
                        </Callout.Text>
                      </Callout.Root>
                    )}
                  </div>
                  <img
                    src={KarpenterImage}
                    alt="Karpenter"
                    className="pointer-events-none absolute right-0 top-0 h-[140px] select-none"
                  />
                </div>
                <AnimatePresence>
                  {watchKarpenterEnabled && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col">
                          {!watchKarpenterEnabled && (
                            <div className="border-t border-neutral-250 p-4">
                              <Callout.Root color="yellow">
                                <Callout.Icon>
                                  <Icon iconName="circle-info" iconStyle="regular" />
                                </Callout.Icon>
                                <Callout.Text>
                                  <Callout.TextDescription>
                                    Before deploying your cluster, update the IAM permissions of the Qovery user, make
                                    sure to use the{' '}
                                    <ExternalLink size="sm" href="https://hub.qovery.com/files/qovery-iam-aws.json">
                                      latest version here
                                    </ExternalLink>{' '}
                                    (adding the permission on SQS)
                                  </Callout.TextDescription>
                                </Callout.Text>
                              </Callout.Root>
                            </div>
                          )}
                          <div className="flex border-t border-neutral-250 p-4 text-sm font-medium text-neutral-400">
                            <div className="w-full">
                              <p className="mb-2">
                                Instance types scope{' '}
                                <Tooltip
                                  classNameContent="max-w-80"
                                  content="Karpenter will create nodes based on the specified list of instance types. By selecting specific instance types, you can control the performance, cost, and architecture of the nodes in your cluster."
                                >
                                  <span className="text-neutral-400">
                                    <Icon iconName="info-circle" iconStyle="regular" />
                                  </span>
                                </Tooltip>
                              </p>
                              <KarpenterInstanceTypePreview
                                defaultServiceArchitecture={watchKarpenter?.default_service_architecture ?? 'AMD64'}
                                requirements={watchKarpenter?.qovery_node_pools?.requirements}
                              />
                            </div>
                            <Button
                              type="button"
                              color="neutral"
                              variant="surface"
                              size="md"
                              className="gap-2"
                              onClick={() => {
                                openModal({
                                  options: {
                                    width: 840,
                                  },
                                  content: (
                                    <KarpenterInstanceFilterModal
                                      cluster={props.cluster}
                                      clusterRegion={props.clusterRegion ?? ''}
                                      defaultValues={watchKarpenter}
                                      onClose={closeModal}
                                      onChange={(values) => {
                                        setValue('karpenter', {
                                          enabled: watchKarpenterEnabled,
                                          spot_enabled: watchKarpenter?.spot_enabled ?? false,
                                          disk_size_in_gib: watchKarpenter?.disk_size_in_gib ?? 50,
                                          ...values,
                                        })
                                      }}
                                    />
                                  ),
                                })
                              }}
                            >
                              Edit <Icon iconName="pen" iconStyle="solid" />
                            </Button>
                          </div>
                          <div className="flex flex-col gap-4 border-t border-neutral-250 p-4">
                            <Controller
                              name="karpenter.spot_enabled"
                              control={control}
                              render={({ field }) => (
                                <InputToggle
                                  value={field.value}
                                  onChange={field.onChange}
                                  className="items-center"
                                  title="Enable spot instances on your cluster"
                                  small
                                />
                              )}
                            />
                            {props.isProduction && watchSpotEnabled && (
                              <Callout.Root color="yellow">
                                <Callout.Icon>
                                  <Icon iconName="info-circle" iconStyle="regular" />
                                </Callout.Icon>
                                <Callout.Text>
                                  <Callout.TextDescription>
                                    Activating spot instances on a production cluster may lead to potential downtime for
                                    applications deployed on the stable node pool. However, you can specify in the
                                    advanced settings to force the use of on-demand instances for your service or
                                    database to avoid this risk.{' '}
                                    <ExternalLink
                                      size="sm"
                                      href="https://hub.qovery.com/docs/using-qovery/configuration/clusters/aws-with-karpenter/#assigning-specific-instances-to-services"
                                    >
                                      See documentation
                                    </ExternalLink>
                                  </Callout.TextDescription>
                                </Callout.Text>
                              </Callout.Root>
                            )}
                          </div>
                          {props.fromDetail && (
                            <div className="flex border-t border-neutral-250 p-4">
                              <Controller
                                name="karpenter.disk_size_in_gib"
                                control={control}
                                rules={{
                                  required: 'Please select a disk size',
                                }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputText
                                    label="Disk size (GB)"
                                    type="number"
                                    name={field.name}
                                    error={error?.message}
                                    onChange={field.onChange}
                                    value={field.value}
                                    className="w-full"
                                    hint="Storage allocated to your Kubernetes nodes to store files, application images etc.."
                                  />
                                )}
                              />
                            </div>
                          )}
                        </div>
                        {watchKarpenterEnabled && props.cluster && (
                          <NodepoolsResourcesSettings cluster={props.cluster} />
                        )}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          />
        </BlockContent>
      )}

      {(!watchKarpenterEnabled || props.cloudProvider !== 'AWS') && (
        <Section className="gap-4">
          <Heading>Resources configuration</Heading>
          <Controller
            name="instance_type"
            control={control}
            rules={{
              required: 'Please select an instance type',
            }}
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col gap-1">
                <InputSelect
                  isSearchable
                  onChange={(event) => {
                    field.onChange(event)
                    if (props.fromDetail) {
                      setWarningClusterNodes(true)
                    }
                  }}
                  value={field.value}
                  label="Instance type"
                  error={error?.message}
                  options={instanceTypeOptions}
                />
                <p className="ml-3 text-xs text-neutral-350">Instance type to be used to run your Kubernetes nodes.</p>
                {warningInstance && (
                  <Callout.Root className="mb-3 mt-1" color="yellow" data-testid="warning-instance">
                    <Callout.Icon>
                      <Icon iconName="triangle-exclamation" iconStyle="regular" />
                    </Callout.Icon>
                    <Callout.Text>
                      <Callout.TextHeading>Be careful</Callout.TextHeading>
                      <Callout.TextDescription>
                        You selected an instance with ARM64/AARCH64 Cpu architecture. To deploy your services, be sure
                        all containers and dockerfile you are using are compatible with this CPU architecture
                      </Callout.TextDescription>
                    </Callout.Text>
                  </Callout.Root>
                )}
              </div>
            )}
          />
          {props.fromDetail && (
            <Controller
              name="disk_size"
              control={control}
              rules={{
                required: 'Please select a disk size',
              }}
              render={({ field }) => (
                <InputText
                  type="number"
                  name={field.name}
                  onChange={(event) => {
                    field.onChange(event)
                    if (props.fromDetail) {
                      setWarningClusterNodes(true)
                    }
                  }}
                  value={field.value}
                  label="Disk size (GB)"
                  hint="Storage allocated to your Kubernetes nodes to store files, application images etc.."
                />
              )}
            />
          )}
          {warningClusterNodes && (
            <Callout.Root color="yellow">
              <Callout.Icon>
                <Icon iconName="circle-exclamation" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text>
                <Callout.TextHeading>
                  Changing these parameters might cause a downtime on your service.
                </Callout.TextHeading>
              </Callout.Text>
            </Callout.Root>
          )}
          {watchClusterType === KubernetesEnum.MANAGED && (
            <>
              <Heading>Nodes auto-scaling</Heading>
              <Controller
                name="nodes"
                control={control}
                rules={{
                  required: 'Please number of nodes',
                }}
                render={({ field }) => (
                  <div>
                    {watchNodes && (
                      <p className="mb-3 font-medium text-neutral-400">{`min ${watchNodes[0]} - max ${watchNodes[1]}`}</p>
                    )}
                    <Slider onChange={field.onChange} value={field.value} max={200} min={3} step={1} />
                    <p className="mt-3 text-xs text-neutral-350">
                      Cluster can scale up to “max” nodes depending on its usage
                    </p>
                  </div>
                )}
              />
            </>
          )}
        </Section>
      )}

      {!props.fromDetail && props.cloudProvider === CloudProviderEnum.AWS && (
        <Callout.Root className="items-center" color="sky" data-testid="aws-cost-banner">
          <Callout.Icon className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
            <Icon name={IconEnum.AWS} />
          </Callout.Icon>
          <Callout.Text>
            <Callout.TextHeading>
              {watchClusterType === KubernetesEnum.MANAGED ? 'Starting at $220 /month' : 'Starting at $20 /month'}
            </Callout.TextHeading>
            <Callout.TextDescription>
              Approximate cost charged by the cloud provider based on your consumption
            </Callout.TextDescription>
          </Callout.Text>
        </Callout.Root>
      )}
    </div>
  )
}

export default ClusterResourcesSettings
