import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { addCreditCard } from '@qovery/domains/organization'
import { useModal } from '@qovery/shared/ui'
import { AppDispatch } from '@qovery/store'
import { CreditCardFormValues } from '../../credit-card-form/ui/credit-card-form'
import AddCreditCardModal from '../ui/add-credit-card-modal'

export interface AddCreditCardModalFeatureProps {
  organizationId?: string
}

export function AddCreditCardModalFeature(props: AddCreditCardModalFeatureProps) {
  const methods = useForm<CreditCardFormValues>()
  const { closeModal } = useModal()
  const dispatch = useDispatch<AppDispatch>()
  const [loading, setLoading] = useState(false)

  const onSubmit = methods.handleSubmit((data) => {
    if (data.card_number && data.expiry && data.cvc && props.organizationId) {
      setLoading(true)
      let expiryYear = Number(data.expiry.split('/')[1])
      // if expiryYear does not have 4 digits, we add 2000 to it
      if (expiryYear < 1000) {
        expiryYear += 2000
      }

      dispatch(
        addCreditCard({
          organizationId: props.organizationId,
          creditCardRequest: {
            cvv: data.cvc,
            number: data.card_number,
            expiry_year: expiryYear,
            expiry_month: Number(data.expiry.split('/')[0]),
          },
        })
      )
        .unwrap()
        .then(() => {
          closeModal()
        })
        .catch((err) => {
          console.error(err)
        })
        .finally(() => setLoading(false))
    }
  })

  return (
    <FormProvider {...methods}>
      <AddCreditCardModal closeModal={closeModal} onSubmit={onSubmit} loading={loading} />
    </FormProvider>
  )
}

export default AddCreditCardModalFeature
