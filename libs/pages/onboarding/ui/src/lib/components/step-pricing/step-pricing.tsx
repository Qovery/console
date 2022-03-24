import { PlanEnum } from '@console/shared/enums'
import { Plan, Value } from '@console/shared/interfaces'
import { Button, ButtonSize, ButtonStyle, Icon, InputSelectSmall } from '@console/shared/ui'
import { ONBOARDING_URL, ONBOARDING_PROJECT_URL } from '@console/shared/utils'
import { PlanCard } from '../plan-card/plan-card'

interface StepPricingProps {
  selectPlan: string
  setSelectPlan: (value: PlanEnum) => void
  plans: Plan[]
  chooseDeploy: (value: Value | null) => void
  currentValue: { [name: string]: { number?: string | undefined; disable: boolean | undefined } }
  currentDeploy: Value
  deploys: Value[]
  onSubmit: () => void
  loading: boolean
  onClickContact: () => void
}

export function StepPricing(props: StepPricingProps) {
  const {
    selectPlan,
    setSelectPlan,
    plans,
    chooseDeploy,
    currentValue,
    deploys,
    currentDeploy,
    onSubmit,
    loading,
    onClickContact,
  } = props

  return (
    <div>
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
        <div className="flex justify-between items-center mb-4">
          <p className="text-text-500 text-sm">Number of deployments needed</p>
          <InputSelectSmall
            name="pricing"
            items={deploys}
            defaultItem={currentDeploy}
            getValue={(name, value: Value | null) => chooseDeploy(value)}
            className="w-32"
          ></InputSelectSmall>
        </div>

        {plans.map((plan: Plan, index: number) => (
          <PlanCard
            key={index}
            name={plan.name}
            selected={selectPlan}
            title={plan.title}
            text={plan.text}
            price={plan.price}
            listPrice={plan.listPrice}
            currentValue={currentValue}
            onClick={() => setSelectPlan(plan.name)}
            disable={currentValue[plan.name].disable}
          />
        ))}

        <div className="mt-10 pt-5 flex justify-between border-t border-element-light-lighter-400">
          <Button
            link={`${ONBOARDING_URL}${ONBOARDING_PROJECT_URL}`}
            size={ButtonSize.BIG}
            style={ButtonStyle.STROKED}
            iconLeft="icon-solid-arrow-left"
          >
            Back
          </Button>
          {selectPlan === PlanEnum.ENTERPRISE && (
            <Button onClick={onClickContact} size={ButtonSize.BIG} style={ButtonStyle.BASIC}>
              Contact us
            </Button>
          )}
          {selectPlan !== PlanEnum.ENTERPRISE && (
            <Button size={ButtonSize.BIG} style={ButtonStyle.BASIC} onClick={onSubmit} loading={loading}>
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
