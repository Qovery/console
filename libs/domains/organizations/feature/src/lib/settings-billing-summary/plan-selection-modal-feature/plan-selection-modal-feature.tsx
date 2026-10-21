import { PlanEnum } from 'qovery-typescript-axios'
import { useState } from 'react'
import { type FormEventHandler } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Controller, useFormContext } from 'react-hook-form'
import { Button, RadioGroup } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { useChangePlan } from '../../hooks/use-change-plan/use-change-plan'

const SELECTABLE_PLANS: PlanEnum[] = [
  PlanEnum.STARTER_2026,
  PlanEnum.GROWTH_2026,
  PlanEnum.SCALE_2026,
  PlanEnum.ENTERPRISE_2025,
]

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
    return props.currentPlan?.toUpperCase() === plan
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
                          <span className="rounded bg-surface-neutral-subtle px-2 py-0.5 text-xs font-medium text-neutral-subtle">
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
 * Normalizes the current plan to match the selectable plan enum values
 * Only returns a value if the current plan is already a selectable plan
 * Returns undefined for other plans to avoid pre-selection
 */
function normalizePlanSelection(currentPlan?: string): PlanEnum | undefined {
  return SELECTABLE_PLANS.find((plan) => plan === currentPlan?.toUpperCase())
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
