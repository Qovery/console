import { type FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Button, InputRadio } from '@qovery/shared/ui'

export interface PlanSelectionModalProps {
  onClose: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  isSubmitting?: boolean
  currentPlan?: string
}

export function PlanSelectionModal(props: PlanSelectionModalProps) {
  const { control } = useFormContext()

  const isCurrentPlan = (plan: string) => {
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
              <div className="flex flex-col gap-3">
                <label className="flex cursor-pointer items-center gap-3 rounded border border-neutral-200 p-4 transition-colors hover:bg-neutral-100">
                  <InputRadio
                    name={field.name}
                    value="TEAM"
                    formValue={field.value}
                    onChange={field.onChange}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-400">Team</span>
                      {isCurrentPlan('TEAM') && (
                        <span className="rounded bg-neutral-150 px-2 py-0.5 text-xs font-medium text-neutral-350">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-neutral-350">For growing teams</div>
                  </div>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded border border-neutral-200 p-4 transition-colors hover:bg-neutral-100">
                  <InputRadio
                    name={field.name}
                    value="ENTERPRISE"
                    formValue={field.value}
                    onChange={field.onChange}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-400">Enterprise</span>
                      {isCurrentPlan('ENTERPRISE') && (
                        <span className="rounded bg-neutral-150 px-2 py-0.5 text-xs font-medium text-neutral-350">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-neutral-350">For large organizations</div>
                  </div>
                </label>
              </div>
              {error && <p className="mt-2 text-xs text-red-500">{error.message}</p>}
            </div>
          )}
        />
        <div className="flex justify-end gap-3">
          <Button type="button" size="lg" color="neutral" variant="plain" onClick={props.onClose}>
            Cancel
          </Button>
          <Button data-testid="submit-button" type="submit" size="lg" loading={props.isSubmitting}>
            Confirm
          </Button>
        </div>
      </form>
    </div>
  )
}

export default PlanSelectionModal
