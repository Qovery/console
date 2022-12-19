import { PlanEnum } from 'qovery-typescript-axios'
import { ONBOARDING_PROJECT_URL, ONBOARDING_URL } from '@qovery/shared/router'
import { Button, ButtonSize, ButtonStyle, Icon } from '@qovery/shared/ui'
import { OrganizationPlan } from '../../feature/onboarding-pricing/onboarding-pricing'
import PlanCard from '../plan-card/plan-card'

export interface StepPricingProps {
  selectPlan: PlanEnum
  setSelectPlan: (value: PlanEnum) => void
  plans: OrganizationPlan[]
  onSubmit: () => void
  loading: boolean
  onClickContact: () => void
}

export function StepPricing(props: StepPricingProps) {
  const { selectPlan, onSubmit, plans, loading, setSelectPlan, onClickContact } = props

  return (
    <div className="pb-10">
      <h1 className="h3 text-text-700 mb-3">Simple, transparent pricing</h1>
      <p className="text-sm mb-10 text-text-500">
        14 days trial with no credit card required for all paid plans
        <a
          href="https://qovery.com/pricing"
          target="_blank"
          rel="noreferrer"
          className="link text-accent2-500 text-sm ml-1"
        >
          see details plan
          <Icon name="icon-solid-arrow-up-right-from-square" className="ml-1" />
        </a>
        .
      </p>
      <form>
        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((plan: OrganizationPlan) => (
            <PlanCard
              key={plan.name}
              name={plan.name}
              title={plan.title}
              text={plan.text}
              price={plan.price}
              onClick={() => setSelectPlan(plan.name)}
            />
          ))}
        </div>
        <div className="mt-10 pt-5 flex justify-between border-t border-element-light-lighter-400">
          <Button
            link={`${ONBOARDING_URL}${ONBOARDING_PROJECT_URL}`}
            size={ButtonSize.XLARGE}
            style={ButtonStyle.STROKED}
            iconLeft="icon-solid-arrow-left"
          >
            Back
          </Button>
          {selectPlan === PlanEnum.ENTERPRISE && (
            <Button onClick={onClickContact} size={ButtonSize.XLARGE} style={ButtonStyle.BASIC}>
              Contact us
            </Button>
          )}
          {selectPlan !== PlanEnum.ENTERPRISE && (
            <Button size={ButtonSize.XLARGE} style={ButtonStyle.BASIC} onClick={onSubmit} loading={loading}>
              Let’s go
              <span className="ml-1" role="img" aria-label="star">
                💫
              </span>
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

export default StepPricing
