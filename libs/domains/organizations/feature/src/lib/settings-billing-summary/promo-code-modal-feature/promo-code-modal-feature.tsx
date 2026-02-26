import { useState } from 'react'
import { type FormEventHandler } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Controller, useFormContext } from 'react-hook-form'
import { Button, InputText } from '@qovery/shared/ui'
import { useAddCreditCode } from '../../hooks/use-add-credit-code/use-add-credit-code'

export interface PromoCodeModalProps {
  onClose: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  isSubmitting?: boolean
}

export function PromoCodeModal(props: PromoCodeModalProps) {
  const { control } = useFormContext()

  return (
    <div className="p-6">
      <h2 className="h4 mb-4 max-w-sm text-neutral">Promo code</h2>
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

export interface PromocodeModalFeatureProps {
  organizationId?: string
  closeModal: () => void
}

export function PromoCodeModalFeature({ organizationId, closeModal }: PromocodeModalFeatureProps) {
  const methods = useForm<{ code: string }>({ defaultValues: { code: '' }, mode: 'all' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { mutateAsync: addCreditCode } = useAddCreditCode()

  const onSubmit = methods.handleSubmit(async (data) => {
    if (organizationId && data.code) {
      setIsSubmitting(true)

      try {
        await addCreditCode({ organizationId, code: data.code })
        closeModal()
      } catch (error) {
        console.error(error)
      }

      setIsSubmitting(false)
    }
  })

  return (
    <FormProvider {...methods}>
      <PromoCodeModal onSubmit={onSubmit} onClose={closeModal} isSubmitting={isSubmitting} />
    </FormProvider>
  )
}

export default PromoCodeModalFeature
