import { DeploymentRestrictionModeEnum, DeploymentRestrictionTypeEnum } from 'qovery-typescript-axios'
import { type FormEventHandler, useEffect } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { InputSelect, InputText, ModalCrud, useModal } from '@qovery/shared/ui'

export interface CrudModalProps {
  onClose: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  isEdit: boolean
}

export function CrudModal({ onClose, onSubmit, isEdit }: CrudModalProps) {
  const { control, formState } = useFormContext()
  const { enableAlertClickOutside } = useModal()

  useEffect(() => {
    enableAlertClickOutside(formState.isDirty)
  }, [enableAlertClickOutside, formState])

  return (
    <ModalCrud
      title={isEdit ? 'Edit restriction' : 'Create restriction'}
      isEdit={isEdit}
      onSubmit={onSubmit}
      onClose={onClose}
    >
      <Controller
        name="mode"
        control={control}
        rules={{
          required: 'Please enter a value.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputSelect
            className="mb-6"
            onChange={field.onChange}
            value={field.value}
            error={error?.message}
            options={Object.values(DeploymentRestrictionModeEnum).map((s) => ({ value: s, label: s }))}
            label="Mode"
          />
        )}
      />
      <Controller
        name="type"
        control={control}
        rules={{
          required: 'Please enter a value.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputSelect
            className="mb-6"
            onChange={field.onChange}
            value={field.value}
            error={error?.message}
            options={Object.values(DeploymentRestrictionTypeEnum).map((s) => ({ value: s, label: s }))}
            label="Type"
            disabled
          />
        )}
      />
      <Controller
        name="value"
        control={control}
        rules={{
          required: 'Please enter a value.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            className="mb-3"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            error={error?.message}
            label="Value"
          />
        )}
      />
    </ModalCrud>
  )
}
export default CrudModal
