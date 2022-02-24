import { Button, ButtonSize, ButtonType, InputSelect, Value } from "@console/shared-ui"
import { ONBOARDING_URL, ONBOARDING_MORE_URL } from "@console/shared/utils"
import { InputRadio } from "@console/shared-ui"
import { useState } from "react"

/* eslint-disable-next-line */
export interface StepPricingProps {}

export function StepPricing(props: StepPricingProps) {

  const [select, setSelect] = useState('free');
  const [pro, setPro] = useState('300');
  const [business, setBusiness] = useState('1000');
  const [defaultValue, SetDefaultValue] = useState({
    pro: {
      label: '300/month',
      value: '300'
    },
    business: {
      label: '1000/month',
      value: '1000'
    }
  })

  const planChoose = select;
  const displayDeploy = planChoose === 'pro' || planChoose === 'business';

  const plans = [
    {
      name: 'free',
      title: 'Free',
      text: 'Adapted for personnal project',
      price: 0,
      listDeploy: [],
      listPrice: [],
    },
    {
      name: 'pro',
      title: 'Professional',
      text: 'For 5-20 members',
      price: 49,
      listDeploy: [
        {label: '300/month', value: '300'},
        {label: '400/month', value: '400'},
        {label: '500/month', value: '500'},
        {label: '600/month', value: '600'},
        {label: '700/month', value: '700'},
        {label: '800/month', value: '800'},
        {label: '900/month', value: '900'},
        {label: '1000/month', value: '1000'},
        {label: '2000/month', value: '2000'},
        {label: '3000/month', value: '3000'},
      ],
      listPrice: [
        {number: '300', price: '49'},
        {number: '400', price: '99'},
        {number: '500', price: '149'},
        {number: '600', price: '199'},
        {number: '700', price: '249'},
        {number: '800', price: '299'},
        {number: '900', price: '349'},
        {number: '1000', price: '399'},
        {number: '2000', price: '899'},
        {number: '3000', price: '1399'}
      ]
    },
    {
      name: 'business',
      title: 'Business',
      text: 'For medium compagny',
      price: 399,
      listDeploy: [
        {label: '1000/month', value: '1000'},
        {label: '1100/month', value: '1100'},
        {label: '1200/month', value: '1200'},
        {label: '1300/month', value: '1300'},
        {label: '1400/month', value: '1400'},
        {label: '1500/month', value: '1500'},
        {label: '1600/month', value: '1600'},
        {label: '1700/month', value: '1700'},
        {label: '1800/month', value: '1800'},
        {label: '1900/month', value: '1900'},
        {label: '2000/month', value: '2000'},
        {label: '3000/month', value: '3000'},
        {label: '4000/month', value: '4000'},
      ],
      listPrice: [
        {number: '1000', price: '599'},
        {number: '1100', price: '649'},
        {number: '1200', price: '699'},
        {number: '1300', price: '749'},
        {number: '1400', price: '799'},
        {number: '1500', price: '849'},
        {number: '1600', price: '899'},
        {number: '1700', price: '949'},
        {number: '1800', price: '999'},
        {number: '1900', price: '1049'},
        {number: '2000', price: '1099'},
        {number: '3000', price: '1599'},
        {number: '4000', price: '2099'}
      ]
    },
    {
      name: 'enterprise',
      title: 'Enterprise',
      text: 'For large compagny',
      price: 0,
      listDeploy: [],
      listPrice: [],
    }
  ]

  const onClickSelect = ((plan: string) => {
    setSelect(plan);
  })

  const chooseDeploy = (value: Value | null, plan: string) => {
    switch(plan) {
      case 'pro':
        setPro(value?.value || '1000');
        break;
      case 'business':
        setBusiness(value?.value || '1000');
        break;
    }
  }

  return (
    <div>
      <h1 className="h3 text-text-700 mb-3">Simple, transparent pricing</h1>
      <p className="text-sm mb-10 text-text-500">
        14 day trial and no credit card required for all paid plans. See details plan.
      </p>
      <form>
        {plans.map((plan) =>
          <div key={plan.name} className={`${planChoose === plan.name ? 'bg-white text-text-700' : 'text-text-500 bg-element-light-lighter-200'} p-5 mb-2 border border-element-light-lighter-500 rounded flex justify-between items-center cursor-pointer transition-all`} onClick={() => onClickSelect(plan.name)}>
            <div className='flex items-start gap-3'>
              <InputRadio name='plan' value={plan.name} isChecked={planChoose === plan.name}/>
              <div>
                <h2 className='leading-none text-base font-normal mb-1'><b className='font-bold'>{plan.title}</b> <span className='text-text-500'>plan</span></h2>
                <p className='text-sm text-text-500'>{plan.text}</p>
              </div>
            </div>
            {plan.name !== 'enterprise' && <p className='text-xl font-bold flex items-center gap-1'>
              &#36;
              {plan.name === 'free' && plan.price}
              {plan.name === 'business' && plan.listPrice.find(p => p.number === business)?.price} 
              {plan.name === 'pro' && plan.listPrice.find(p => p.number === pro)?.price} 
              <span className='text-sm font-normal text-text-500'>/ Month</span>
            </p>}
            {plan.name === 'enterprise' && <p className='text-xs font-bold uppercase'>
              Contact us
            </p>}
          </div>
        )}

        {displayDeploy && plans.map((plan) =>
          <div key={plan.name} className='mt-5'>
            {planChoose === plan.name && <div className='flex justify-between items-center'>
              <p className='text-text-500 text-sm'>Price calculate on deployments need</p>
              <InputSelect name='pricing' label='Number of deployement' items={plan.listDeploy} className='w-48' getValue={(name, value) => chooseDeploy(value, plan.name)} defaultItem={defaultValue[plan.name]} />
            </div>}
          </div>
        )}

        <div className="mt-10 pt-5 flex justify-between border-t border-element-light-lighter-400">
          <Button link={`${ONBOARDING_URL}${ONBOARDING_MORE_URL}`} size={ButtonSize.BIG} type={ButtonType.STROKED} iconLeft="icon-solid-arrow-left">
            Back
          </Button>
          <Button size={ButtonSize.BIG} type={ButtonType.BASIC} link={`${ONBOARDING_URL}`}>
            Select plan
          </Button>
        </div>

      </form>
      
    </div>
  )
}

export default StepPricing
