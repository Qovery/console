import { CloudProviderEnum, KubernetesEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { IconEnum } from '@qovery/shared/enums'
import { ClusterResourcesData, Value } from '@qovery/shared/interfaces'
import {
  BannerBox,
  BannerBoxEnum,
  BlockContent,
  InputRadioBox,
  InputSelect,
  InputText,
  Link,
  Slider,
} from '@qovery/shared/ui'

export interface ClusterResourcesSettingsProps {
  fromDetail?: boolean
  clusterTypeOptions?: Value[]
  instanceTypeOptions?: Value[]
  cloudProvider?: CloudProviderEnum
  showWarningInstance?: boolean
}

export function ClusterResourcesSettings(props: ClusterResourcesSettingsProps) {
  const { control, watch } = useFormContext<ClusterResourcesData>()
  const watchNodes = watch('nodes')
  const [warningInstance, setWarningInstance] = useState(false)
  const watchClusterType = watch('cluster_type')

  const watchInstanceType = watch('instance_type')

  useEffect(() => {
    const instanceType: Value | undefined = props.instanceTypeOptions?.find(
      (option) => option.value === watchInstanceType
    )
    if (instanceType) {
      setWarningInstance(instanceType.label.indexOf('ARM') !== -1)
    }
  }, [watchInstanceType, props.instanceTypeOptions])

  return (
    <div>
      <BannerBox
        className="mb-5"
        title="Qovery manages this resource for you"
        message={
          <span>
            Use exclusively the Qovery console to update the resources managed by Qovery on your cloud account.
            <br /> Do not manually update or upgrade them on the cloud provider console, otherwise you will risk a drift
            in the configuration.
            <Link
              className="ml-0.5"
              size="text-xs"
              link="https://hub.qovery.com/docs/useful-resources/faq/#how-do-you-support-new-kubernetes-version"
              linkLabel="See more details"
              external
            />
          </span>
        }
        type={BannerBoxEnum.WARNING}
      />
      <BlockContent title="Cluster" className="mb-5">
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
          <div className="border border-neutral-250 rounded p-4 text-neutral-400 text-sm">
            {props.clusterTypeOptions &&
              props.clusterTypeOptions[0] &&
              `${props.clusterTypeOptions[0].label} - ${props.clusterTypeOptions[0].description}`}
          </div>
        )}
      </BlockContent>
      <BlockContent title="Cluster Nodes" className="mb-8">
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
                onChange={field.onChange}
                value={field.value}
                label="Instance type"
                error={error?.message}
                options={props.instanceTypeOptions || []}
              />
              <p className="text-neutral-350 text-xs my-3">Instance type to be used to run your Kubernetes nodes.</p>
              {warningInstance && (
                <BannerBox
                  dataTestId="warning-instance"
                  message="You selected an instance with ARM64/AARCH64 Cpu architecture. To deploy your services, be sure all containers and dockerfile you are using are compatible with this CPU architecture"
                  className="mb-3"
                  title="Be careful"
                  type={BannerBoxEnum.WARNING}
                />
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
              className="mb-3"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              label="Disk size (GB)"
            />
          )}
        />
        <p className="text-neutral-350 text-xs my-3">
          Storage allocated to your Kubernetes nodes to store files, application images etc..
        </p>
      </BlockContent>

      {watchClusterType === KubernetesEnum.MANAGED && (
        <BlockContent title="Nodes auto-scaling" className="mb-10">
          <Controller
            name="nodes"
            control={control}
            rules={{
              required: 'Please number of nodes',
            }}
            render={({ field }) => (
              <div>
                {watchNodes && (
                  <p className="text-neutral-400 mb-3 font-medium">{`min ${watchNodes[0]} - max ${watchNodes[1]}`}</p>
                )}
                <Slider onChange={field.onChange} value={field.value} max={200} min={1} step={1} />
                <p className="text-neutral-350 text-xs mt-3">
                  Cluster can scale up to “max” nodes depending on its usage
                </p>
              </div>
            )}
          />
        </BlockContent>
      )}

      {!props.fromDetail && props.cloudProvider === CloudProviderEnum.AWS && (
        <BannerBox
          dataTestId="aws-cost-banner"
          iconRealColors
          icon={IconEnum.AWS}
          iconInCircle
          type={BannerBoxEnum.DEFAULT}
          className="mb-10"
          message="Approximate cost charged by the cloud provider based on your consumption"
          title={`${
            watchClusterType === KubernetesEnum.MANAGED ? 'Starting at $220 /month' : 'Starting at $20 /month'
          }`}
        />
      )}
    </div>
  )
}

export default ClusterResourcesSettings
