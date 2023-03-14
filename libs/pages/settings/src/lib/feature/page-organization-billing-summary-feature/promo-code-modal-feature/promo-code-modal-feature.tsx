import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { addCreditCode } from '@qovery/domains/organization'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'
import PromoCodeModal from '../../../ui/page-organization-billing-summary/promo-code-modal/promo-code-modal'

export interface PromocodeModalFeatureProps {
  organizationId: string | undefined
  closeModal: () => void
}

export function PromoCodeModalFeature(props: PromocodeModalFeatureProps) {
  const methods = useForm<{ code: string }>({ defaultValues: { code: '' }, mode: 'all' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = methods.handleSubmit((data) => {
    if (props.organizationId && data.code) {
      setIsSubmitting(true)
      addCreditCode({ organizationId: props.organizationId, code: data.code })
        .then(() => {
          props.closeModal()
          toast(ToastEnum.SUCCESS, 'Credit code added')
        })
        .catch((err) => {
          console.error(err)
          toastError(err)
        })
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
