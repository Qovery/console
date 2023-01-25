import { Controller, useFormContext } from 'react-hook-form'
import { ClusterResourcesData, Value } from '@qovery/shared/interfaces'
import { BlockContent, InputSelect, Slider } from '@qovery/shared/ui'

export interface ClusterResourcesSettingsProps {
  fromDetail?: boolean
  options?: Value[]
}

export function ClusterResourcesSettings(props: ClusterResourcesSettingsProps) {
  const { control } = useFormContext<ClusterResourcesData>()

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
            <InputSelect
              className="mb-3"
              onChange={field.onChange}
              value={field.value}
              label="Cluster name"
              error={error?.message}
              options={[]}
            />
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
            <InputSelect
              className="mb-3"
              onChange={field.onChange}
              value={field.value}
              label="Cluster name"
              error={error?.message}
              options={[]}
            />
          )}
        />
        <Controller
          name="nodes"
          control={control}
          rules={{
            required: 'Please number of nodes',
          }}
          render={({ field }) => (
            <Slider
              className="mb-3"
              onChange={field.onChange}
              value={field.value}
              label="Cluster name"
              max={10}
              min={1}
              step={1}
              valueLabel="lala"
            />
          )}
        />
      </BlockContent>
    </div>
  )
}

export default ClusterResourcesSettings
