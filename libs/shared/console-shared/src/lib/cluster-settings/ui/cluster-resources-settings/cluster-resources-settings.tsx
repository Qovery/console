import { CloudProviderEnum, CpuArchitectureEnum, KubernetesEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { IconEnum } from '@qovery/shared/enums'
import { type ClusterResourcesData, type Value } from '@qovery/shared/interfaces'
import {
  BlockContent,
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
} from '@qovery/shared/ui'
import KarpenterImage from './karpenter-image'

export interface ClusterResourcesSettingsProps {
  fromDetail?: boolean
  clusterTypeOptions?: Value[]
  instanceTypeOptions?: Value[]
  cloudProvider?: CloudProviderEnum
  showWarningInstance?: boolean
  isProduction?: boolean
}

export function ClusterResourcesSettings(props: ClusterResourcesSettingsProps) {
  const { control, watch } = useFormContext<ClusterResourcesData>()
  const watchNodes = watch('nodes')
  const [warningInstance, setWarningInstance] = useState(false)
  const [warningClusterNodes, setWarningClusterNodes] = useState(false)
  const watchClusterType = watch('cluster_type')
  const watchInstanceType = watch('instance_type')
  const watchKarpenter = watch('karpenter.enabled')

  useEffect(() => {
    const instanceType: Value | undefined = props.instanceTypeOptions?.find(
      (option) => option.value === watchInstanceType
    )
    if (instanceType) {
      setWarningInstance(instanceType.label?.toString().indexOf('ARM') !== -1)
    }
  }, [watchInstanceType, props.instanceTypeOptions])

  return (
    <div className="flex flex-col gap-10">
      <Callout.Root color="yellow">
        <Callout.Icon>
          <Icon iconName="triangle-exclamation" />
        </Callout.Icon>
        <Callout.Text>
          <Callout.TextHeading>Qovery manages this resource for you</Callout.TextHeading>
          <Callout.TextDescription className="text-xs">
            Use exclusively the Qovery console to update the resources managed by Qovery on your cloud account.
            <br /> Do not manually update or upgrade them on the cloud provider console, otherwise you will risk a drift
            in the configuration.
            <ExternalLink
              href="https://hub.qovery.com/docs/useful-resources/faq/#how-do-you-support-new-kubernetes-version"
              className="ml-0.5"
              size="xs"
            >
              See more details
            </ExternalLink>
          </Callout.TextDescription>
        </Callout.Text>
      </Callout.Root>
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
                    onChange={field.onChange}
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
      {!props.isProduction && props.cloudProvider === 'AWS' && (
        <Controller
          name="karpenter.enabled"
          control={control}
          render={({ field }) => (
            <div className="relative flex flex-col gap-2 overflow-hidden rounded border border-neutral-250 bg-neutral-100 p-4">
              <InputToggle
                value={field.value}
                onChange={field.onChange}
                title="(Beta) Karpenter"
                description="Try our new Kubernetes autoscaler"
                forceAlignTop
                disabled={props.fromDetail}
                small
              />
              <ExternalLink
                className="ml-11"
                href="https://hub.qovery.com/docs/using-qovery/configuration/clusters/#features"
              >
                Documentation link
              </ExternalLink>
              <KarpenterImage className="absolute right-0 top-0" />
            </div>
          )}
        />
      )}
      <BlockContent title="Cluster Nodes" className="mb-0">
        <Controller
          name="instance_type"
          control={control}
          rules={{
            required: 'Please select an instance type',
          }}
          render={({ field, fieldState: { error } }) => (
            <div>
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
                options={props.instanceTypeOptions || []}
              />
              <p className="mb-3 ml-4 mt-1 text-xs text-neutral-350">
                Instance type to be used to run your Kubernetes nodes.
              </p>
              {warningInstance && (
                <Callout.Root className="mb-3" color="yellow" data-testid="warning-instance">
                  <Callout.Icon>
                    <Icon iconName="triangle-exclamation" />
                  </Callout.Icon>
                  <Callout.Text>
                    <Callout.TextHeading>Be careful</Callout.TextHeading>
                    <Callout.TextDescription className="text-xs">
                      You selected an instance with ARM64/AARCH64 Cpu architecture. To deploy your services, be sure all
                      containers and dockerfile you are using are compatible with this CPU architecture
                    </Callout.TextDescription>
                  </Callout.Text>
                </Callout.Root>
              )}
            </div>
          )}
        />
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
            />
          )}
        />
        <p className="mb-3 ml-4 mt-1 text-xs text-neutral-350">
          Storage allocated to your Kubernetes nodes to store files, application images etc..
        </p>
        {warningClusterNodes && (
          <Callout.Root color="yellow">
            <Callout.Icon className="text-xs">
              <Icon iconName="circle-exclamation" />
            </Callout.Icon>
            <Callout.Text className="text-xs">
              <Callout.TextHeading>
                Changing these parameters might cause a downtime on your service.
              </Callout.TextHeading>
            </Callout.Text>
          </Callout.Root>
        )}
      </BlockContent>

      {watchClusterType === KubernetesEnum.MANAGED && !watchKarpenter && (
        <BlockContent
          title="Nodes auto-scaling"
          className={
            (!props.fromDetail && props.cloudProvider === CloudProviderEnum.AWS) || watchKarpenter ? 'mb-0' : 'mb-10'
          }
        >
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
                <Slider onChange={field.onChange} value={field.value} max={200} min={1} step={1} />
                <p className="mt-3 text-xs text-neutral-350">
                  Cluster can scale up to “max” nodes depending on its usage
                </p>
              </div>
            )}
          />
        </BlockContent>
      )}

      {watchKarpenter && (
        <Section className="gap-4">
          <Heading>Resources configuration</Heading>
          <Controller
            name="karpenter.disk_size_in_gib"
            control={control}
            rules={{
              required: 'Please select a disk size',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                label="Storage (GB)"
                type="number"
                name={field.name}
                error={error?.message}
                onChange={field.onChange}
                value={field.value}
              />
            )}
          />

          <Controller
            name="karpenter.default_service_architecture"
            control={control}
            defaultValue={CpuArchitectureEnum.AMD64}
            rules={{
              required: 'Please select a node architecture',
            }}
            render={({ field, fieldState: { error } }) => (
              <div>
                <InputSelect
                  onChange={field.onChange}
                  value={field.value}
                  label="Default node architecture"
                  error={error?.message}
                  options={Object.values(CpuArchitectureEnum).map((value) => ({
                    label: value,
                    value,
                  }))}
                />
                <p className="mb-3 ml-4 mt-1 text-xs text-neutral-350">
                  All your applications will be built and deployed on this architecture.
                </p>
              </div>
            )}
          />

          <Controller
            name="karpenter.spot_enabled"
            control={control}
            render={({ field }) => (
              <InputToggle
                value={field.value}
                onChange={field.onChange}
                title="Spot instances"
                description="Enable spot instances on your cluster"
                forceAlignTop
                disabled={props.fromDetail}
                small
              />
            )}
          />
        </Section>
      )}

      {!props.fromDetail && props.cloudProvider === CloudProviderEnum.AWS && (
        <Callout.Root className="mb-10 items-center" color="sky" data-testid="aws-cost-banner">
          <Callout.Icon className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
            <Icon name={IconEnum.AWS} />
          </Callout.Icon>
          <Callout.Text>
            <Callout.TextHeading>
              {watchClusterType === KubernetesEnum.MANAGED ? 'Starting at $220 /month' : 'Starting at $20 /month'}
            </Callout.TextHeading>
            <Callout.TextDescription className="text-xs">
              Approximate cost charged by the cloud provider based on your consumption
            </Callout.TextDescription>
          </Callout.Text>
        </Callout.Root>
      )}
    </div>
  )
}

export default ClusterResourcesSettings
