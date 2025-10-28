import { type FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { ChangePlanType } from '@qovery/domains/organizations/data-access'
import { Button, RadioGroup } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'

export interface PlanSelectionModalProps {
  onClose: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  isSubmitting?: boolean
  currentPlan?: string
  isPlanUnchanged?: boolean
}

export function PlanSelectionModal(props: PlanSelectionModalProps) {
  const { control } = useFormContext()

  const isCurrentPlan = (plan: ChangePlanType) => {
    return props.currentPlan?.toUpperCase().includes(plan)
  }

  return (
    <div className="p-6">
      <h2 className="h4 mb-2 max-w-sm text-neutral-400">Change Plan (Qovery only)</h2>
      <p className="mb-6 text-sm text-neutral-350">
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
                <label
                  className={twMerge(
                    'flex cursor-pointer items-center gap-3 rounded border border-neutral-200 p-4 transition-colors hover:bg-neutral-100',
                    field.value === ChangePlanType.TEAM && 'border-brand-500 bg-brand-50'
                  )}
                >
                  <RadioGroup.Item value={ChangePlanType.TEAM} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-400">Team</span>
                      {isCurrentPlan(ChangePlanType.TEAM) && (
                        <span className="rounded bg-neutral-150 px-2 py-0.5 text-xs font-medium text-neutral-350">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-neutral-350">For growing teams</div>
                  </div>
                </label>
                <label
                  className={twMerge(
                    'flex cursor-pointer items-center gap-3 rounded border border-neutral-200 p-4 transition-colors hover:bg-neutral-100',
                    field.value === ChangePlanType.ENTERPRISE && 'border-brand-500 bg-brand-50'
                  )}
                >
                  <RadioGroup.Item value={ChangePlanType.ENTERPRISE} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-400">Enterprise</span>
                      {isCurrentPlan(ChangePlanType.ENTERPRISE) && (
                        <span className="rounded bg-neutral-150 px-2 py-0.5 text-xs font-medium text-neutral-350">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-neutral-350">For large organizations</div>
                  </div>
                </label>
              </RadioGroup.Root>
              {error && <p className="mt-2 text-xs text-red-500">{error.message}</p>}
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

export default PlanSelectionModal
