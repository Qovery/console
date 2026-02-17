import { PlanEnum } from 'qovery-typescript-axios'
import { useState } from 'react'
import { type FormEventHandler } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Controller, useFormContext } from 'react-hook-form'
import { P, match } from 'ts-pattern'
import { Button, RadioGroup } from '@qovery/shared/ui'
import { is2025Plan } from '@qovery/shared/util-js'
import { twMerge } from '@qovery/shared/util-js'
import { useChangePlan } from '../../hooks/use-change-plan/use-change-plan'

// All 2025 plans are selectable
const SELECTABLE_PLANS = [
  PlanEnum.USER_2025,
  PlanEnum.TEAM_2025,
  PlanEnum.BUSINESS_2025,
  PlanEnum.ENTERPRISE_2025,
] as const

export interface PlanSelectionModalProps {
  onClose: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  isSubmitting?: boolean
  currentPlan?: string
  isPlanUnchanged?: boolean
}

export function PlanSelectionModal(props: PlanSelectionModalProps) {
  const { control } = useFormContext()

  const isCurrentPlan = (plan: PlanEnum) => {
    return props.currentPlan?.toUpperCase().includes(plan)
  }

  return (
    <div className="p-6">
      <h2 className="h4 mb-2 max-w-sm text-neutral">Change Plan (Qovery only)</h2>
      <p className="mb-6 text-sm text-neutral-subtle">
        Select the plan you want to change to. Note: this modal is only visible to Qovery admins
      </p>
      <form onSubmit={props.onSubmit}>
        <Controller
          name="plan"
          control={control}
          rules={{
            required: 'Please select a plan.',
          }}
          render={({ field, fieldState: { error } }) => (
            <div className="mb-6">
              <RadioGroup.Root onValueChange={field.onChange} value={field.value} className="flex flex-col gap-3">
                {SELECTABLE_PLANS.map((plan) => (
                  <label
                    key={plan}
                    className={twMerge(
                      'flex cursor-pointer items-center gap-3 rounded border border-neutral p-4 transition-colors hover:bg-surface-neutral-subtle',
                      field.value === plan && 'border-brand-strong bg-surface-neutral'
                    )}
                  >
                    <RadioGroup.Item value={plan} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-neutral">{plan}</span>
                        {isCurrentPlan(plan) && (
                          <span className="rounded bg-neutral-150 px-2 py-0.5 text-xs font-medium text-neutral-subtle">
                            Current
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </RadioGroup.Root>
              {error && <p className="mt-2 text-xs text-negative">{error.message}</p>}
            </div>
          )}
        />
        <div className="flex justify-end gap-3">
          <Button type="button" size="lg" color="neutral" variant="plain" onClick={props.onClose}>
            Cancel
          </Button>
          <Button
            data-testid="submit-button"
            type="submit"
            size="lg"
            loading={props.isSubmitting}
            disabled={props.isPlanUnchanged}
          >
            Confirm
          </Button>
        </div>
      </form>
    </div>
  )
}

export interface PlanSelectionModalFeatureProps {
  organizationId?: string
  closeModal: () => void
  currentPlan?: string
}

/**
 * Normalizes the current plan to match the 2025 plan enum values
 * Only returns a value if the current plan is already a 2025 plan
 * Returns undefined for legacy plans to avoid pre-selection
 */
function normalizePlanSelection(currentPlan?: string): PlanEnum | undefined {
  if (!is2025Plan(currentPlan)) {
    return undefined
  }

  return match(currentPlan?.toUpperCase())
    .with(P.string.includes('USER'), () => PlanEnum.USER_2025)
    .with(P.string.includes('TEAM'), () => PlanEnum.TEAM_2025)
    .with(P.string.includes('BUSINESS'), () => PlanEnum.BUSINESS_2025)
    .with(P.string.includes('ENTERPRISE'), () => PlanEnum.ENTERPRISE_2025)
    .otherwise(() => undefined)
}

export function PlanSelectionModalFeature({ organizationId, closeModal, currentPlan }: PlanSelectionModalFeatureProps) {
  const normalizedPlan = normalizePlanSelection(currentPlan)

  const methods = useForm<{ plan: PlanEnum }>({ defaultValues: { plan: normalizedPlan as PlanEnum }, mode: 'all' })
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
