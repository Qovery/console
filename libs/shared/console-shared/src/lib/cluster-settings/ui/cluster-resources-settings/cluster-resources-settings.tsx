import { Controller, useFormContext } from 'react-hook-form'
import { IconEnum } from '@qovery/shared/enums'
import { ClusterResourcesData, Value } from '@qovery/shared/interfaces'
import { BlockContent, Icon, InputRadioBox, InputSelect, InputText, Link, Slider } from '@qovery/shared/ui'

export interface ClusterResourcesSettingsProps {
  fromDetail?: boolean
  clusterTypeOptions?: Value[]
  instanceTypeOptions?: Value[]
}

export function ClusterResourcesSettings(props: ClusterResourcesSettingsProps) {
  const { control, watch } = useFormContext<ClusterResourcesData>()
  const watchNodes = watch('nodes')

  return (
    <div>
      <BlockContent title="Cluster" className="mb-5">
        <Controller
          name="cluster_type"
          control={control}
          rules={{
            required: 'Please select a cluster type',
          }}
          render={({ field, fieldState: { error } }) => (
            <>
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
            </>
          )}
        />
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
                onChange={field.onChange}
                value={field.value}
                label="Instance type"
                error={error?.message}
                options={props.instanceTypeOptions || []}
              />
              <Link
                className="text-accent2-500 text-xs block mb-3 ml-3"
                link="https://hub.qovery.com/docs/using-qovery/configuration/deployment-rule/#why-using-deployment-rule"
                linkLabel="How does it work?"
                external
                iconRight="icon-solid-arrow-up-right-from-square"
              />
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
      </BlockContent>

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
                <p className="text-text-500 mb-3 font-medium">{`min ${watchNodes[0]} - max ${watchNodes[1]}`}</p>
              )}
              <Slider onChange={field.onChange} value={field.value} max={10} min={1} step={1} />
              <p className="text-text-400 text-xs mt-3">Cluster can scale up to “max” nodes depending on its usage</p>
            </div>
          )}
        />
      </BlockContent>

      {!props.fromDetail && (
        <div className="flex gap-3 p-4 bg-accent2-50 border border-accent2-500 rounded mb-10">
          <div className="rounded-full overflow-hidden w-12 h-12 bg-white items-center justify-center flex">
            <Icon name={IconEnum.AWS} className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-text-600 font-semibold text-sm mb-1">From $70 to $450/month</h3>
            <p className="text-text-500 text-xs">
              Approximate cost charged by the cloud provider based on your consumption
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClusterResourcesSettings
