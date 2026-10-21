import { PlanEnum } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { ExternalLink, RadioGroup, linkVariants } from '@qovery/shared/ui'
import { formatPlanName, twMerge } from '@qovery/shared/util-js'

export const ACTIVATION_PLANS: PlanEnum[] = [PlanEnum.STARTER_2026, PlanEnum.GROWTH_2026, PlanEnum.SCALE_2026]

// Prices billed monthly without commitment (yearly billing is 20% off and requires contacting our team)
const PLAN_MONTHLY_PRICES: Partial<Record<PlanEnum, number>> = {
  [PlanEnum.STARTER_2026]: 374,
  [PlanEnum.GROWTH_2026]: 1124,
  [PlanEnum.SCALE_2026]: 3749,
}

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

// Organizations start their free trial on the Scale plan
export const DEFAULT_ACTIVATION_PLAN = PlanEnum.SCALE_2026

export function getDefaultActivationPlan(currentPlan?: string): PlanEnum {
  return ACTIVATION_PLANS.find((plan) => plan === currentPlan) ?? DEFAULT_ACTIVATION_PLAN
}

export interface ActivationPlanSelectionProps {
  value: PlanEnum
  onChange: (plan: PlanEnum) => void
  currentPlan?: string
  title?: string
  action?: ReactNode
  onContactUsClick?: () => void
}

export function ActivationPlanSelection({
  value,
  onChange,
  currentPlan,
  title = '1. Choose your plan',
  action,
  onContactUsClick,
}: ActivationPlanSelectionProps) {
  return (
    <div data-plan-selection>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-neutral">{title}</h3>
        <ExternalLink href="https://www.qovery.com/pricing" size="xs">
          Compare plans
        </ExternalLink>
      </div>
      <RadioGroup.Root
        value={value}
        onValueChange={(plan) => onChange(plan as PlanEnum)}
        className="flex flex-col gap-3"
        aria-label="Plan"
      >
        {ACTIVATION_PLANS.map((plan) => (
          <label
            key={plan}
            className={twMerge(
              'flex cursor-pointer items-center gap-3 rounded border border-neutral p-4 transition-colors hover:bg-surface-neutral-subtle',
              value === plan && 'border-brand-strong bg-surface-neutral'
            )}
          >
            <RadioGroup.Item value={plan} />
            <span className="flex-1 text-sm font-medium text-neutral">{formatPlanName(plan)}</span>
            {currentPlan === plan && (
              <span className="rounded bg-surface-neutral-subtle px-2 py-0.5 text-xs font-medium text-neutral-subtle">
                Current plan
              </span>
            )}
            {PLAN_MONTHLY_PRICES[plan] !== undefined && (
              <span className="text-sm font-medium text-neutral">
                {priceFormatter.format(PLAN_MONTHLY_PRICES[plan])}
                <span className="text-xs font-normal text-neutral-subtle"> / month</span>
              </span>
            )}
          </label>
        ))}
      </RadioGroup.Root>
      {action && <div className="mt-3 flex justify-end">{action}</div>}
      <p className="mt-3 text-xs text-neutral-subtle">
        This plan is billed monthly once your trial ends. You can switch plan until then. Need yearly billing or an
        Enterprise plan?
        {onContactUsClick && (
          <>
            {' '}
            <button type="button" className={linkVariants({ color: 'brand', size: 'xs' })} onClick={onContactUsClick}>
              Contact our team
            </button>
          </>
        )}
      </p>
    </div>
  )
}

export default ActivationPlanSelection
