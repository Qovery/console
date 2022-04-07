import { OrganizationPlan, OrganizationPlanType } from '@console/domains/organization'
import { Button, ButtonSize, ButtonStyle, Icon, Slider } from '@console/shared/ui'
import { ONBOARDING_URL, ONBOARDING_PROJECT_URL } from '@console/shared/utils'
import { PlanCard } from '../plan-card/plan-card'

export interface StepPricingProps {
  selectPlan: OrganizationPlanType
  setSelectPlan: (value: OrganizationPlanType) => void
  plans: OrganizationPlan[]
  chooseDeploy: (value: number | null) => void
  currentValue: { [name: string]: { number?: string | undefined; disable: boolean | undefined } }
  currentDeploy: number
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
    currentDeploy,
    onSubmit,
    loading,
    onClickContact,
  } = props

  const priceParagraph = () => {
    const currentPlans = plans.find((plan) => plan.name === selectPlan)

    if (currentPlans && currentPlans.price > 0) {
      const nbDeploy = selectPlan === OrganizationPlanType.BUSINESS ? 1000 : 300
      let deploymentPrice = 0

      if (currentDeploy > nbDeploy) {
        deploymentPrice = ((currentDeploy - nbDeploy) / 100) * 50
      }

      return (
        <p className="text-xs text-text-400 text-right mt-2">
          {`Price computed as: Base Plan (${
            currentPlans?.price
          }$) + ${currentDeploy} Deployments (${deploymentPrice}$) = ${currentPlans?.price + deploymentPrice}$`}
        </p>
      )
    } else {
      return null
    }
  }

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
        <div className="flex mb-4">
          <Slider
            min={100}
            max={4000}
            step={100}
            label="Number of deployments needed"
            valueLabel="/month"
            defaultValue={currentDeploy}
            getValue={(value: number) => chooseDeploy(value)}
          />
        </div>

        {plans.map((plan: OrganizationPlan) => (
          <PlanCard
            key={plan.name}
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
        {priceParagraph()}
        <p className="text-xs text-text-400 text-right mt-1">Price plan does not include your AWS costs</p>
        <div className="mt-10 pt-5 flex justify-between border-t border-element-light-lighter-400">
          <Button
            link={`${ONBOARDING_URL}${ONBOARDING_PROJECT_URL}`}
            size={ButtonSize.BIG}
            style={ButtonStyle.STROKED}
            iconLeft="icon-solid-arrow-left"
          >
            Back
          </Button>
          {selectPlan === OrganizationPlanType.ENTERPRISE && (
            <Button onClick={onClickContact} size={ButtonSize.BIG} style={ButtonStyle.BASIC}>
              Contact us
            </Button>
          )}
          {selectPlan !== OrganizationPlanType.ENTERPRISE && (
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
