import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { PlanEnum } from '@qovery/domains/organizations/data-access'
import { useChangePlan } from '@qovery/domains/organizations/feature'
import PlanSelectionModal from '../../../ui/page-organization-billing-summary/plan-selection-modal/plan-selection-modal'

export interface PlanSelectionModalFeatureProps {
  organizationId?: string
  closeModal: () => void
  currentPlan?: string
}

export function PlanSelectionModalFeature({ organizationId, closeModal, currentPlan }: PlanSelectionModalFeatureProps) {
  // Normalize the current plan to match radio button values (TEAM or ENTERPRISE)
  const normalizedPlan = currentPlan?.toUpperCase().includes('TEAM')
    ? PlanEnum.TEAM
    : currentPlan?.toUpperCase().includes('ENTERPRISE')
      ? PlanEnum.ENTERPRISE
      : ''

  const methods = useForm<{ plan: string }>({ defaultValues: { plan: normalizedPlan }, mode: 'all' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { mutateAsync: changePlan } = useChangePlan()

  const onSubmit = methods.handleSubmit(async (data) => {
    if (organizationId && data.plan) {
      setIsSubmitting(true)

      try {
        await changePlan({ organizationId, plan: data.plan })
        closeModal()
      } catch (error) {
        console.error(error)
      }

      setIsSubmitting(false)
    }
  })

  return (
    <FormProvider {...methods}>
      <PlanSelectionModal
        onSubmit={onSubmit}
        onClose={closeModal}
        isSubmitting={isSubmitting}
        currentPlan={currentPlan}
        isPlanUnchanged={methods.watch('plan') === normalizedPlan}
      />
    </FormProvider>
  )
}

export default PlanSelectionModalFeature
