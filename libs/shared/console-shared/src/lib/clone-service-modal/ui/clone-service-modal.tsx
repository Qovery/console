import { Environment, Project } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { ApplicationEntity, DatabaseEntity } from '@qovery/shared/interfaces'
import { InputSelect, InputText, LoaderSpinner, ModalCrud } from '@qovery/shared/ui'

export interface CloneServiceModalProps {
  closeModal: () => void
  environments: Environment[]
  loading: boolean
  isFetchEnvironmentsLoading: boolean
  onSubmit: () => void
  projects: Project[]
  serviceToClone: ApplicationEntity | DatabaseEntity
}

export function CloneServiceModal({
  closeModal,
  environments,
  loading,
  isFetchEnvironmentsLoading,
  onSubmit,
  projects,
  serviceToClone,
}: CloneServiceModalProps) {
  const { control, setValue } = useFormContext()

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
            onChange={field.onChange}
            value={field.value}
            label="New service name"
            error={error?.message}
          />
        )}
      />
      <Controller
        name="project"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <InputSelect
            dataTestId="input-select-project"
            className="mb-6"
            onChange={(...args) => {
              setValue('environment', '')
              field.onChange(...args)
            }}
            value={field.value}
            label="Project"
            error={error?.message}
            options={projects.map((c) => ({ value: c.id, label: c.name }))}
            portal={true}
          />
        )}
      />

      <Controller
        name="environment"
        control={control}
        rules={{ required: true }}
        render={({ field, fieldState: { error } }) => (
          <>
            {isFetchEnvironmentsLoading ? (
              <div className="flex justify-center">
                <LoaderSpinner />
              </div>
            ) : (
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
          </>
        )}
      />
    </ModalCrud>
  )
}

export default CloneServiceModal
