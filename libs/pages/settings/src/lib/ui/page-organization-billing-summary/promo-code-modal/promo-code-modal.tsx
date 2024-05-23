import { type FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Button, InputText } from '@qovery/shared/ui'

export interface PromoCodeModalProps {
  onClose: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  isSubmitting?: boolean
}

export function PromoCodeModal(props: PromoCodeModalProps) {
  const { control } = useFormContext()

  return (
    <div className="p-6">
      <h2 className="h4 mb-4 max-w-sm text-neutral-400">Promo code</h2>
      <form onSubmit={props.onSubmit}>
        <Controller
          name="code"
          control={control}
          rules={{
            required: 'Please enter promo code.',
          }}
          defaultValue=""
          render={({ field, fieldState: { error } }) => (
            <InputText
              className="mb-6"
              label="Promo code"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
            />
          )}
        />
        <div className="flex justify-end gap-3">
          <Button type="button" size="lg" color="neutral" variant="plain" onClick={props.onClose}>
            Cancel
          </Button>
          <Button data-testid="submit-button" type="submit" size="lg" loading={props.isSubmitting}>
            Submit
          </Button>
        </div>
      </form>
    </div>
  )
}

export default PromoCodeModal
