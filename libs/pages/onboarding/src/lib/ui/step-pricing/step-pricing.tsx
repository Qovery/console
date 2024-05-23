import { type PlanEnum } from 'qovery-typescript-axios'
import { ONBOARDING_PROJECT_URL, ONBOARDING_URL } from '@qovery/shared/routes'
import { Icon, Link } from '@qovery/shared/ui'
import { type OrganizationPlan } from '../../feature/onboarding-pricing/onboarding-pricing'
import PlanCard from '../plan-card/plan-card'

export interface StepPricingProps {
  plans: OrganizationPlan[]
  onSubmit: (plan: PlanEnum) => void
  loading: string
  onClickContact: () => void
}

export function StepPricing(props: StepPricingProps) {
  const { onSubmit, plans, loading } = props

  return (
    <div className="pb-10">
      <h1 className="h3 mb-3 text-center text-neutral-400">Simple, transparent pricing</h1>
      <p className="mb-10 text-center text-sm text-neutral-400">
        14 days trial with no credit card required for all paid plans
        <a
          href="https://qovery.com/pricing"
          target="_blank"
          rel="noreferrer"
          className="link relative -top-0.5 ml-1 text-sm text-sky-500"
        >
          see details plan
          <Icon name="icon-solid-arrow-up-right-from-square" className="ml-1" />
        </a>
      </p>
      <form>
        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((plan: OrganizationPlan) => (
            <PlanCard key={plan.name} onClick={() => onSubmit(plan.name)} loading={loading} {...plan} />
          ))}
        </div>
        <div className="mt-10 flex justify-between border-t border-neutral-200 pt-5">
          <Link
            as="button"
            className="gap-2"
            color="neutral"
            variant="surface"
            size="lg"
            to={ONBOARDING_URL + ONBOARDING_PROJECT_URL}
          >
            <Icon name="icon-solid-arrow-left" />
            Back
          </Link>
        </div>
      </form>
    </div>
  )
}

export default StepPricing
