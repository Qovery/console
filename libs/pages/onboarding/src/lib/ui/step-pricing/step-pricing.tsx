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
      <h1 className="h3 text-neutral-400 mb-3 text-center">Simple, transparent pricing</h1>
      <p className="text-sm mb-10 text-neutral-400 text-center">
        14 days trial with no credit card required for all paid plans
        <a
          href="https://qovery.com/pricing"
          target="_blank"
          rel="noreferrer"
          className="link text-sky-500 text-sm ml-1 relative -top-0.5"
        >
          see details plan
          <Icon name="icon-solid-arrow-up-right-from-square" className="ml-1" />
        </a>
      </p>
      <form>
        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((plan: OrganizationPlan) => (
            <PlanCard key={plan.name} onClick={() => onSubmit(plan.name)} loading={loading} {...plan} />
          ))}
        </div>
        <div className="mt-10 pt-5 flex justify-between border-t border-neutral-200">
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
