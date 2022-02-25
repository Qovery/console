import { Button, ButtonSize, ButtonType, InputSelect, Value, PlanEnum } from '@console/shared/ui'
import { ONBOARDING_URL, ONBOARDING_MORE_URL, ONBOARDING_PROJECT_URL, useDocumentTitle } from '@console/shared/utils'
import { useState } from 'react'
import { PlanCard, Price } from '../plan-card/plan-card'

export interface Plan {
  name: string
  title: string
  text: string
  price?: number
  listPrice: Price[]
  listDeploy: Value[]
}

const PLANS: Plan[] = [
  {
    name: PlanEnum.FREE,
    title: 'Free',
    text: 'Adapted for personnal project',
    price: 0,
    listDeploy: [],
    listPrice: [],
  },
  {
    name: PlanEnum.PRO,
    title: 'Professional',
    text: 'For 5-20 members',
    price: 49,
    listDeploy: [
      { label: '300/month', value: '300' },
      { label: '400/month', value: '400' },
      { label: '500/month', value: '500' },
      { label: '600/month', value: '600' },
      { label: '700/month', value: '700' },
      { label: '800/month', value: '800' },
      { label: '900/month', value: '900' },
      { label: '1000/month', value: '1000' },
      { label: '2000/month', value: '2000' },
      { label: '3000/month', value: '3000' },
    ],
    listPrice: [
      { number: '300', price: '49' },
      { number: '400', price: '99' },
      { number: '500', price: '149' },
      { number: '600', price: '199' },
      { number: '700', price: '249' },
      { number: '800', price: '299' },
      { number: '900', price: '349' },
      { number: '1000', price: '399' },
      { number: '2000', price: '899' },
      { number: '3000', price: '1399' },
    ],
  },
  {
    name: PlanEnum.BUSINESS,
    title: 'Business',
    text: 'For medium compagny',
    price: 399,
    listDeploy: [
      { label: '1000/month', value: '1000' },
      { label: '1100/month', value: '1100' },
      { label: '1200/month', value: '1200' },
      { label: '1300/month', value: '1300' },
      { label: '1400/month', value: '1400' },
      { label: '1500/month', value: '1500' },
      { label: '1600/month', value: '1600' },
      { label: '1700/month', value: '1700' },
      { label: '1800/month', value: '1800' },
      { label: '1900/month', value: '1900' },
      { label: '2000/month', value: '2000' },
      { label: '3000/month', value: '3000' },
      { label: '4000/month', value: '4000' },
    ],
    listPrice: [
      { number: '1000', price: '599' },
      { number: '1100', price: '649' },
      { number: '1200', price: '699' },
      { number: '1300', price: '749' },
      { number: '1400', price: '799' },
      { number: '1500', price: '849' },
      { number: '1600', price: '899' },
      { number: '1700', price: '949' },
      { number: '1800', price: '999' },
      { number: '1900', price: '1049' },
      { number: '2000', price: '1099' },
      { number: '3000', price: '1599' },
      { number: '4000', price: '2099' },
    ],
  },
  {
    name: PlanEnum.ENTERPRISE,
    title: 'Enterprise',
    text: 'For large compagny',
    price: 0,
    listDeploy: [],
    listPrice: [],
  },
]

const PLAN_DEFAULT: string = PlanEnum.FREE
const DEFAULT_VALUE = {
  [PlanEnum.PRO]: PLANS.find((p) => p.name === PlanEnum.PRO)?.listDeploy[0],
  [PlanEnum.BUSINESS]: PLANS.find((p) => p.name === PlanEnum.BUSINESS)?.listDeploy[0],
}

const DEFAULT_PRICE = {
  [PlanEnum.PRO]: { number: PLANS.find((p) => p.name === PlanEnum.PRO)?.listPrice[0].number },
  [PlanEnum.BUSINESS]: { number: PLANS.find((p) => p.name === PlanEnum.BUSINESS)?.listPrice[0].number },
}

export function StepPricing() {
  useDocumentTitle('Onboarding Pricing - Qovery')

  const [select, setSelect] = useState(PLAN_DEFAULT)
  const [currentValue, setCurrentValue] = useState(DEFAULT_PRICE)

  const displayDeploy = select === PlanEnum.PRO || select === PlanEnum.BUSINESS

  const chooseDeploy = (value: Value | null, plan: string) => {
    if (value) {
      switch (plan) {
        case PlanEnum.PRO:
          setCurrentValue({ ...currentValue, [PlanEnum.PRO]: { number: value?.value } })
          break
        case PlanEnum.BUSINESS:
          setCurrentValue({ ...currentValue, [PlanEnum.BUSINESS]: { number: value?.value } })
          break
      }
    }
  }

  return (
    <div>
      <h1 className="h3 text-text-700 mb-3">Simple, transparent pricing</h1>
      <p className="text-sm mb-10 text-text-500">
        14 day trial and no credit card required for all paid plans. See details plan.
      </p>
      <form>
        {PLANS.map((plan, index) => (
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
          />
        ))}

        {displayDeploy &&
          PLANS.map((plan: Plan) => (
            <div key={plan.name} className="mt-5">
              {select === plan.name && (
                <div className="flex justify-between items-center">
                  <p className="text-text-500 text-sm">Price calculate on deployments need</p>
                  <InputSelect
                    name="pricing"
                    label="Number of deployement"
                    items={plan.listDeploy}
                    className="w-48"
                    getValue={(name, value: Value | null) => chooseDeploy(value, plan.name)}
                    defaultItem={DEFAULT_VALUE[plan.name]}
                  />
                </div>
              )}
            </div>
          ))}

        <div className="mt-10 pt-5 flex justify-between border-t border-element-light-lighter-400">
          <Button
            link={`${ONBOARDING_URL}${ONBOARDING_MORE_URL}`}
            size={ButtonSize.BIG}
            type={ButtonType.STROKED}
            iconLeft="icon-solid-arrow-left"
          >
            Back
          </Button>
          <Button size={ButtonSize.BIG} type={ButtonType.BASIC} link={`${ONBOARDING_URL}${ONBOARDING_PROJECT_URL}`}>
            Select plan
          </Button>
        </div>
      </form>
    </div>
  )
}

export default StepPricing
