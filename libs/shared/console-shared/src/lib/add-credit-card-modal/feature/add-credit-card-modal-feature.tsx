import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useAddCreditCard } from '@qovery/domains/organizations/feature'
import { useModal } from '@qovery/shared/ui'
import { type CreditCardFormValues } from '../../credit-card-form/ui/credit-card-form'
import AddCreditCardModal from '../ui/add-credit-card-modal'

export interface AddCreditCardModalFeatureProps {
  organizationId: string
}

export function AddCreditCardModalFeature({ organizationId }: AddCreditCardModalFeatureProps) {
  const methods = useForm<CreditCardFormValues>()
  const { closeModal } = useModal()
  const [loading, setLoading] = useState(false)
  const { mutateAsync: addCreditCard } = useAddCreditCard()

  const onSubmit = methods.handleSubmit(async (data) => {
    if (data.card_number && data.expiry && data.cvc && organizationId) {
      setLoading(true)

      try {
        await addCreditCard({
          organizationId,
          creditCardRequest: {
            cvv: data.cvc,
            number: data.card_number,
            expiry_year: Number(data.expiry.split('/')[1]),
            expiry_month: Number(data.expiry.split('/')[0]),
          },
        })
        closeModal()
      } catch (error) {
        console.error(error)
      }

      setLoading(false)
    }
  })

  return (
    <FormProvider {...methods}>
      <AddCreditCardModal closeModal={closeModal} onSubmit={onSubmit} loading={loading} />
    </FormProvider>
  )
}

export default AddCreditCardModalFeature
