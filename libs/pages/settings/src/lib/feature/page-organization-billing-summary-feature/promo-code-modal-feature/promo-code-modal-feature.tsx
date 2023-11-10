import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useAddCreditCode } from '@qovery/domains/organizations/feature'
import PromoCodeModal from '../../../ui/page-organization-billing-summary/promo-code-modal/promo-code-modal'

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
