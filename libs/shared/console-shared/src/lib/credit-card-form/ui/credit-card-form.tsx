import { CreditCard } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { InputText } from '@qovery/shared/ui'

export interface CreditCardFormProps {
  creditCard?: CreditCard
}

export interface CreditCardFormValues {
  full_name: string
  expiry?: string
  card_number: string
  cvc: string
  country: string
}

export function CreditCardForm(props: CreditCardFormProps) {
  const { control, watch } = useFormContext<CreditCardFormValues>()

  watch((data) => {
    console.log(data)
  })

  return (
    <div>
      <Controller
        name={'card_number'}
        control={control}
        rules={{
          required: 'Please enter the card number',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            className="mb-3"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Card number"
            error={error?.message}
          />
        )}
      />

      <Controller
        name={'expiry'}
        control={control}
        rules={{
          required: 'Please enter the card expiry date',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            className="mb-3"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Expiration date"
            error={error?.message}
          />
        )}
      />

      <Controller
        name={'cvc'}
        control={control}
        rules={{
          required: 'Please enter the card CVC',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            className="mb-3"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="CVC"
            error={error?.message}
          />
        )}
      />
    </div>
  )
}

export default CreditCardForm
