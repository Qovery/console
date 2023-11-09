import { type CreditCard } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { InputCreditCard } from '@qovery/shared/ui'

export interface CreditCardFormProps {
  creditCard?: CreditCard
}

export interface CreditCardFormValues {
  expiry?: string
  card_number: string
  cvc: string
}

export function CreditCardForm(props: CreditCardFormProps) {
  const { control } = useFormContext<CreditCardFormValues>()

  return (
    <div>
      <Controller
        name="card_number"
        control={control}
        rules={{
          required: 'Please enter the card number',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputCreditCard
            className="mb-3"
            name={field.name}
            label="Card number"
            error={error?.message}
            type="number"
            onChange={field.onChange}
            value={field.value}
          />
        )}
      />

      <Controller
        name="expiry"
        control={control}
        rules={{
          required: 'Please enter the card expiry date',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputCreditCard
            className="mb-3"
            type="expiry"
            name={field.name}
            onChange={field.onChange}
            label="Expiration date"
            error={error?.message}
            value={field.value}
          />
        )}
      />

      <Controller
        name="cvc"
        control={control}
        rules={{
          required: 'Please enter the card CVC',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputCreditCard
            className="mb-3"
            type="cvc"
            name={field.name}
            onChange={field.onChange}
            label="CVC"
            error={error?.message}
            value={field.value}
          />
        )}
      />
    </div>
  )
}

export default CreditCardForm
