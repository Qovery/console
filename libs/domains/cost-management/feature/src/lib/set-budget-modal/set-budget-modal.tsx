import { Controller, useForm } from 'react-hook-form'
import { Button, InputText, useModal } from '@qovery/shared/ui'

export interface SetBudgetModalProps {
  title: string
  description: string
  currentLimit: number
  onSubmit: (monthlyLimit: number) => void
  /** Offered when the target projects can fall back on the organization default. */
  onResetToDefault?: () => void
}

export function SetBudgetModal({ title, description, currentLimit, onSubmit, onResetToDefault }: SetBudgetModalProps) {
  const { closeModal } = useModal()
  const { control, handleSubmit, formState } = useForm({
    mode: 'onChange',
    defaultValues: { monthlyLimit: String(currentLimit) },
  })

  const submit = handleSubmit(({ monthlyLimit }) => {
    onSubmit(Number(monthlyLimit))
    closeModal()
  })

  return (
    <form className="p-6" onSubmit={submit}>
      <h2 className="h4 mb-1 text-neutral">{title}</h2>
      <p className="mb-6 text-sm text-neutral-subtle">{description}</p>

      <Controller
        name="monthlyLimit"
        control={control}
        rules={{
          required: 'Please enter a monthly limit.',
          validate: (value) => (Number(value) >= 0 ? true : 'The limit cannot be negative.'),
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            type="number"
            label="Monthly limit (USD)"
            error={error?.message}
          />
        )}
      />

      <div className="mt-6 flex items-center justify-end gap-3">
        {onResetToDefault && (
          <Button
            type="button"
            variant="plain"
            color="neutral"
            size="lg"
            className="mr-auto"
            onClick={() => {
              onResetToDefault()
              closeModal()
            }}
          >
            Reset to default
          </Button>
        )}
        <Button type="button" variant="plain" color="neutral" size="lg" onClick={closeModal}>
          Cancel
        </Button>
        <Button type="submit" size="lg" disabled={!formState.isValid}>
          Set budget
        </Button>
      </div>
    </form>
  )
}

export default SetBudgetModal
