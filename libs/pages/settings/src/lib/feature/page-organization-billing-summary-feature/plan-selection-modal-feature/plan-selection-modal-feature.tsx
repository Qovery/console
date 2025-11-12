import { PlanEnum } from 'qovery-typescript-axios'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { is2025Plan } from '@qovery/domains/organizations/data-access'
import { useChangePlan } from '@qovery/domains/organizations/feature'
import PlanSelectionModal from '../../../ui/page-organization-billing-summary/plan-selection-modal/plan-selection-modal'

export interface PlanSelectionModalFeatureProps {
  organizationId?: string
  closeModal: () => void
  currentPlan?: string
}

export function PlanSelectionModalFeature({ organizationId, closeModal, currentPlan }: PlanSelectionModalFeatureProps) {
  // Only normalize and pre-select if already on a 2025 plan
  // If on a legacy plan (e.g., TEAM), don't pre-select any radio button
  const normalizedPlan = is2025Plan(currentPlan)
    ? currentPlan?.toUpperCase().includes('USER')
      ? PlanEnum.USER_2025
      : currentPlan?.toUpperCase().includes('TEAM')
        ? PlanEnum.TEAM_2025
        : currentPlan?.toUpperCase().includes('BUSINESS')
          ? PlanEnum.BUSINESS_2025
          : currentPlan?.toUpperCase().includes('ENTERPRISE')
            ? PlanEnum.ENTERPRISE_2025
            : ('' as PlanEnum)
    : ('' as PlanEnum)

  const methods = useForm<{ plan: PlanEnum }>({ defaultValues: { plan: normalizedPlan }, mode: 'all' })
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
