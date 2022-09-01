/* eslint-disable-next-line */
import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { ClusterEntity, EnvironmentEntity, Value } from '@console/shared/interfaces'
import { Button, ButtonStyle, InputSelect, InputText } from '@console/shared/ui'

export interface CreateCloneEnvironmentModalProps {
  onSubmit: () => void
  environmentToClone?: EnvironmentEntity
  clusters?: ClusterEntity[]
  closeModal: () => void
  loading: boolean
}

export function CreateCloneEnvironmentModal(props: CreateCloneEnvironmentModalProps) {
  const { formState, control } = useFormContext()

  const [environmentModes] = useState<Value[]>([
    { value: EnvironmentModeEnum.PREVIEW, label: 'Preview' },
    { value: EnvironmentModeEnum.DEVELOPMENT, label: 'Development' },
    { value: EnvironmentModeEnum.STAGING, label: 'Staging' },
    { value: EnvironmentModeEnum.PRODUCTION, label: 'Production' },
  ])
  const [clusterItems, setClusterItems] = useState<Value[]>([])

  useEffect(() => {
    if (props.clusters && props.clusters.length)
      setClusterItems(props.clusters.map((c) => ({ value: c.id, label: c.name })))
  }, [setClusterItems, props.clusters])

  return (
    <div className="p-6">
      <h2 className="h4 text-text-600 mb-2 max-w-sm">
        {props.environmentToClone ? 'Clone Environment' : 'Create Environment'}
      </h2>
      <p className="text-text-400 text-sm mb-6">You will have the possibility to modify the parameters once created</p>
      <form onSubmit={props.onSubmit}>
        {props.environmentToClone && (
          <InputText
            className="mb-6"
            name="clone"
            value={props.environmentToClone.name}
            label={props.environmentToClone.name ? 'New environment name' : 'Environment name'}
            disabled={true}
          />
        )}

        <Controller
          name="name"
          control={control}
          rules={{
            required: 'Please enter a value',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              className="mb-6"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              label="Environment name"
              error={error?.message}
            />
          )}
        />
        <Controller
          name="cluster_id"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <InputSelect
              dataTestId="input-select-cluster"
              className="mb-6"
              onChange={field.onChange}
              value={field.value}
              label="Value"
              error={error?.message}
              items={clusterItems}
            />
          )}
        />
        <Controller
          name="mode"
          control={control}
          rules={{
            required: 'Please select a value.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputSelect
              className="mb-6"
              portal={false}
              dataTestId="input-select-mode"
              items={environmentModes}
              onChange={field.onChange}
              value={field.value}
              label="Type"
            />
          )}
        />

        <div className="flex gap-3 justify-end">
          <Button className="btn--no-min-w" style={ButtonStyle.STROKED} onClick={() => props.closeModal()}>
            Cancel
          </Button>
          <Button
            dataTestId="submit-button"
            className="btn--no-min-w"
            type="submit"
            disabled={!formState.isValid}
            loading={props.loading}
          >
            {props.environmentToClone ? 'Clone' : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreateCloneEnvironmentModal
