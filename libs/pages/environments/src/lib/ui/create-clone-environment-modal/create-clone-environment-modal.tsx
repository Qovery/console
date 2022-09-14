import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import { FormEvent, useEffect, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { ClusterEntity, EnvironmentEntity, Value } from '@qovery/shared/interfaces'
import { InputSelect, InputText, ModalCrud } from '@qovery/shared/ui'

export interface CreateCloneEnvironmentModalProps {
  onSubmit: () => void
  environmentToClone?: EnvironmentEntity
  clusters?: ClusterEntity[]
  closeModal: () => void
  loading: boolean
}

export function CreateCloneEnvironmentModal(props: CreateCloneEnvironmentModalProps) {
  const { control } = useFormContext()

  const [environmentModes] = useState<Value[]>([
    { value: 'automatic', label: 'Automatic' },
    { value: EnvironmentModeEnum.DEVELOPMENT, label: 'Development' },
    { value: EnvironmentModeEnum.STAGING, label: 'Staging' },
    { value: EnvironmentModeEnum.PRODUCTION, label: 'Production' },
  ])
  const [clusterItems, setClusterItems] = useState<Value[]>([])

  useEffect(() => {
    if (props.clusters && props.clusters.length) {
      setClusterItems([
        { label: 'Automatic', value: 'automatic' },
        ...props.clusters.map((c) => ({ value: c.id, label: c.name })),
      ])
    }
  }, [setClusterItems, props.clusters])

  return (
    <ModalCrud
      title={props.environmentToClone ? 'Clone Environment' : 'Create Environment'}
      description="You will have the possibility to modify the parameters once created"
      onClose={props.closeModal}
      onSubmit={props.onSubmit}
      submitLabel={props.environmentToClone ? 'Clone' : 'Create'}
    >
      {props.environmentToClone && (
        <InputText
          className="mb-6"
          name="clone"
          value={props.environmentToClone.name}
          label="Environment to clone"
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
            onChange={(event: FormEvent<HTMLInputElement>) => {
              field.onChange(
                event.currentTarget.value
                  .replace(/[^\w\s\\/]/g, '-') // remove special chars but keep / and \
                  .toLowerCase()
                  .replace(/ /g, '-')
              )
            }}
            value={field.value}
            label={props.environmentToClone?.name ? 'New environment name' : 'Environment name'}
            error={error?.message}
          />
        )}
      />
      <Controller
        name="cluster"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <InputSelect
            dataTestId="input-select-cluster"
            className="mb-6"
            onChange={field.onChange}
            value={field.value}
            label="Cluster"
            error={error?.message}
            options={clusterItems}
            portal={true}
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
            dataTestId="input-select-mode"
            options={environmentModes}
            onChange={field.onChange}
            value={field.value}
            label="Type"
            portal={true}
          />
        )}
      />
    </ModalCrud>
  )
}

export default CreateCloneEnvironmentModal
