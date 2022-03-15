import { Plan, Value } from '@console/shared/interfaces'
import { Button, ButtonSize, ButtonStyle, InputSelectSmall, PlanEnum } from '@console/shared/ui'
import { ONBOARDING_URL, ONBOARDING_PROJECT_URL, ONBOARDING_THANKS_URL } from '@console/shared/utils'
import { PlanCard } from '../plan-card/plan-card'

interface StepPricingProps {
  select: string
  setSelect: (value: string) => void
  displayDeploy: boolean
  plans: Plan[]
  chooseDeploy: (value: Value | null) => void
  currentValue: { [name: string]: { number?: string | undefined; disable: boolean | undefined } }
  defaultValue: { [name: string]: Value | undefined }
  currentDeploy: Value
  deploys: Value[]
}

export function StepPricing(props: StepPricingProps) {
  const { select, setSelect, plans, displayDeploy, chooseDeploy, currentValue, defaultValue, deploys, currentDeploy } =
    props

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
          See details plan
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
            selected={select}
            title={plan.title}
            text={plan.text}
            price={plan.price}
            listPrice={plan.listPrice}
            currentValue={currentValue}
            onClick={() => setSelect(plan.name)}
            disable={currentValue[plan.name].disable}
          />
        ))}

        <div className="mt-10 pt-5 flex justify-between border-t border-element-light-lighter-400">
          <Button
            link={`${ONBOARDING_URL}${ONBOARDING_THANKS_URL}`}
            size={ButtonSize.BIG}
            style={ButtonStyle.STROKED}
            iconLeft="icon-solid-arrow-left"
          >
            Back
          </Button>
          {select === PlanEnum.ENTERPRISE && (
            <Button size={ButtonSize.BIG} style={ButtonStyle.BASIC} link={`${ONBOARDING_URL}${ONBOARDING_PROJECT_URL}`}>
              Contact us
            </Button>
          )}
          {select !== PlanEnum.ENTERPRISE && (
            <Button size={ButtonSize.BIG} style={ButtonStyle.BASIC} link={`${ONBOARDING_URL}${ONBOARDING_PROJECT_URL}`}>
              Select plan
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

export default StepPricing
