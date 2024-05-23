import { DeploymentRestrictionModeEnum, DeploymentRestrictionTypeEnum } from 'qovery-typescript-axios'
import { type FormEventHandler, useEffect } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { ExternalLink, InputSelect, InputText, ModalCrud, useModal } from '@qovery/shared/ui'

export interface CrudModalProps {
  onClose: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  isEdit: boolean
  isLoading: boolean
}

export function CrudModal({ onClose, onSubmit, isEdit, isLoading }: CrudModalProps) {
  const { control, formState } = useFormContext()
  const { enableAlertClickOutside } = useModal()

  useEffect(() => {
    enableAlertClickOutside(formState.isDirty)
  }, [enableAlertClickOutside, formState])

  return (
    <ModalCrud
      title={isEdit ? 'Edit restriction' : 'Create restriction'}
      description="Specify which changes in your repository should trigger or not an auto-deploy of your application."
      isEdit={isEdit}
      loading={isLoading}
      onSubmit={onSubmit}
      onClose={onClose}
      howItWorks={
        <>
          <p>Two modes can be selected:</p>
          <ul className="ml-4 list-disc">
            <li>EXCLUDE: commits on the file or folder defined in the "Value" field will be ignored</li>
            <li>MATCH: only commits on the file or folder defined in the "Value" field will trigger a deployment</li>
          </ul>
          <p>Wildcards are not supported in the "Value" field</p>
          <ExternalLink
            className="mt-2"
            href="https://hub.qovery.com/docs/using-qovery/deployment/deploying-with-auto-deploy/#filtering-commits-triggering-the-auto-deploy"
          >
            Documentation
          </ExternalLink>
        </>
      }
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
