import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { addCreditCode } from '@qovery/domains/organization'
import { AppDispatch } from '@qovery/store'
import PromoCodeModal from '../../../ui/page-organization-billing-summary/promo-code-modal/promo-code-modal'

export interface PromocodeModalFeatureProps {
  organizationId: string | undefined
  closeModal: () => void
}

export function PromoCodeModalFeature(props: PromocodeModalFeatureProps) {
  const methods = useForm<{ code: string }>({ defaultValues: { code: '' }, mode: 'all' })
  const dispatch = useDispatch<AppDispatch>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = methods.handleSubmit((data) => {
    if (props.organizationId && data.code) {
      setIsSubmitting(true)
      dispatch(addCreditCode({ organizationId: props.organizationId, code: data.code }))
        .unwrap()
        .then(props.closeModal)
        .catch(console.error)
        .finally(() => {
          setIsSubmitting(false)
        })
    }
  })

  return (
    <FormProvider {...methods}>
      <PromoCodeModal onSubmit={onSubmit} onClose={props.closeModal} isSubmitting={isSubmitting} />
    </FormProvider>
  )
}

export default PromoCodeModalFeature
