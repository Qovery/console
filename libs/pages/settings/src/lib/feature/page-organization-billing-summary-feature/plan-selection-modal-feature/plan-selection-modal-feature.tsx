import { PlanEnum } from 'qovery-typescript-axios'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { match, P } from 'ts-pattern'
import { is2025Plan } from '@qovery/domains/organizations/data-access'
import { useChangePlan } from '@qovery/domains/organizations/feature'
import PlanSelectionModal from '../../../ui/page-organization-billing-summary/plan-selection-modal/plan-selection-modal'

export interface PlanSelectionModalFeatureProps {
  organizationId?: string
  closeModal: () => void
  currentPlan?: string
}

/**
 * Normalizes the current plan to match the 2025 plan enum values
 * Only returns a value if the current plan is already a 2025 plan
 * Returns empty string for legacy plans to avoid pre-selection
 */
function normalizePlanSelection(currentPlan?: string): PlanEnum | '' {
  if (!is2025Plan(currentPlan)) {
    return '' as PlanEnum
  }

  return match(currentPlan?.toUpperCase())
    .with(P.string.includes('USER'), () => PlanEnum.USER_2025)
    .with(P.string.includes('TEAM'), () => PlanEnum.TEAM_2025)
    .with(P.string.includes('BUSINESS'), () => PlanEnum.BUSINESS_2025)
    .with(P.string.includes('ENTERPRISE'), () => PlanEnum.ENTERPRISE_2025)
    .otherwise(() => '' as PlanEnum)
}

export function PlanSelectionModalFeature({ organizationId, closeModal, currentPlan }: PlanSelectionModalFeatureProps) {
  const normalizedPlan = normalizePlanSelection(currentPlan)

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
