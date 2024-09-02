import { CloudProviderEnum, CpuArchitectureEnum, KubernetesEnum } from 'qovery-typescript-axios'
import { Fragment, useEffect, useState } from 'react'
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
  const { control, watch, setValue } = useFormContext<ClusterResourcesData>()
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
      {!props.isProduction && props.cloudProvider === 'AWS' && watchClusterType === KubernetesEnum.MANAGED && (
        <Controller
          name="karpenter.enabled"
          defaultValue={false}
          control={control}
          render={({ field }) => (
            <div className="relative flex flex-col gap-2 overflow-hidden rounded border border-neutral-250 bg-neutral-100 p-4">
              <InputToggle
                className="max-w-[70%]"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                title="Reduce your costs by enabling Karpenter (Beta)"
                description="Karpenter simplifies Kubernetes infrastructure with the right nodes at the right time."
                forceAlignTop
                disabled={props.fromDetail}
                small
              />
              <ExternalLink
                className="ml-11"
                href="https://hub.qovery.com/docs/using-qovery/configuration/clusters/#managing-your-clusters-with-qovery"
              >
                Documentation link
              </ExternalLink>
              <KarpenterImage className="absolute right-0 top-0" />
            </div>
          )}
        />
      )}

      {watchKarpenter && (
        <Callout.Root color="yellow">
          <Callout.Icon>
            <Icon iconName="triangle-exclamation" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>
            <Callout.TextHeading>Warning</Callout.TextHeading>
            <Callout.TextDescription className="text-xs">
              Before deploying your cluster, update the IAM permissions of the Qovery user, make sure to use the{' '}
              <ExternalLink size="xs" href="https://hub.qovery.com/files/qovery-iam-aws.json">
                latest version here
              </ExternalLink>{' '}
              (adding the permission on SQS)
            </Callout.TextDescription>
          </Callout.Text>
        </Callout.Root>
      )}

      <Section className="gap-4">
        <Heading>Resources configuration</Heading>

        {watchKarpenter ? (
          <Fragment key={`karpenter-${watchKarpenter}`}>
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
                  hint="Storage allocated to your Kubernetes nodes to store files, application images etc.."
                />
              )}
            />

            <Controller
              name="karpenter.default_service_architecture"
              control={control}
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
                  <p className="ml-4 mt-1 text-xs text-neutral-350">
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
                  small
                />
              )}
            />
          </Fragment>
        ) : (
          <>
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
                    options={props.instanceTypeOptions || []}
                  />
                  <p className="ml-4 text-xs text-neutral-350">
                    Instance type to be used to run your Kubernetes nodes.
                  </p>
                  {warningInstance && (
                    <Callout.Root className="mb-3 mt-1" color="yellow" data-testid="warning-instance">
                      <Callout.Icon>
                        <Icon iconName="triangle-exclamation" iconStyle="regular" />
                      </Callout.Icon>
                      <Callout.Text>
                        <Callout.TextHeading>Be careful</Callout.TextHeading>
                        <Callout.TextDescription className="text-xs">
                          You selected an instance with ARM64/AARCH64 Cpu architecture. To deploy your services, be sure
                          all containers and dockerfile you are using are compatible with this CPU architecture
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
                  hint="Storage allocated to your Kubernetes nodes to store files, application images etc.."
                />
              )}
            />
            {warningClusterNodes && (
              <Callout.Root color="yellow">
                <Callout.Icon className="text-xs">
                  <Icon iconName="circle-exclamation" iconStyle="regular" />
                </Callout.Icon>
                <Callout.Text className="text-xs">
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
                      <Slider onChange={field.onChange} value={field.value} max={200} min={1} step={1} />
                      <p className="mt-3 text-xs text-neutral-350">
                        Cluster can scale up to “max” nodes depending on its usage
                      </p>
                    </div>
                  )}
                />
              </>
            )}
          </>
        )}
      </Section>

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
