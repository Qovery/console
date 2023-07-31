import { Environment } from 'qovery-typescript-axios'
import { FormEvent } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { ApplicationEntity, DatabaseEntity } from '@qovery/shared/interfaces'
import { InputSelect, InputText, ModalCrud } from '@qovery/shared/ui'

export interface CloneServiceModalProps {
  closeModal: () => void
  environments: Environment[]
  loading: boolean
  onSubmit: () => void
  serviceToClone: ApplicationEntity | DatabaseEntity
}

export function CloneServiceModal({
  closeModal,
  environments,
  loading,
  onSubmit,
  serviceToClone,
}: CloneServiceModalProps) {
  const { control } = useFormContext()

  return (
    <ModalCrud
      title="Clone Service"
      description="Clone the service on the same or different target environment."
      onClose={closeModal}
      onSubmit={onSubmit}
      loading={loading}
      submitLabel="Clone"
    >
      <InputText className="mb-6" name="clone" value={serviceToClone.name} label="Service to clone" disabled={true} />

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
            label="New service name"
            error={error?.message}
          />
        )}
      />
      <Controller
        name="environment"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <InputSelect
            dataTestId="input-select-environment"
            className="mb-6"
            onChange={field.onChange}
            value={field.value}
            label="Environment"
            error={error?.message}
            options={environments.map((c) => ({ value: c.id, label: c.name }))}
            portal={true}
          />
        )}
      />
    </ModalCrud>
  )
}

export default CloneServiceModal
