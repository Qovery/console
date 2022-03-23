import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router'
import { StepPricing } from '@console/pages/onboarding/ui'
import { Value, Plan } from '@console/shared/interfaces'
import { useOrganization } from '@console/domains/organization'
import {
  ONBOARDING_PRICING_URL,
  ONBOARDING_PROJECT_URL,
  ONBOARDING_URL,
  useAuth,
  useDocumentTitle,
} from '@console/shared/utils'
import { PlanEnum } from '@console/shared/enums'
import { useProjects } from '@console/domains/projects'
import { ContextOnboarding } from '../container/container'

const DEPLOYS: Value[] = [
  { label: '100/month', value: '100' },
  { label: '200/month', value: '200' },
  { label: '300/month', value: '300' },
  { label: '400/month', value: '400' },
  { label: '500/month', value: '500' },
  { label: '600/month', value: '600' },
  { label: '700/month', value: '700' },
  { label: '800/month', value: '800' },
  { label: '900/month', value: '900' },
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
]

const PLANS: Plan[] = [
  {
    name: PlanEnum.FREE,
    title: 'Free',
    text: 'Adapted for personnal project',
    price: 0,
    listPrice: [],
  },
  {
    name: PlanEnum.PROFESSIONAL,
    title: 'Professional',
    text: 'For 5-20 members',
    price: 49,
    listPrice: [
      { number: '100', price: '49' },
      { number: '200', price: '49' },
      { number: '300', price: '49' },
      { number: '400', price: '99' },
      { number: '500', price: '149' },
      { number: '600', price: '199' },
      { number: '700', price: '249' },
      { number: '800', price: '299' },
      { number: '900', price: '349' },
      { number: '1000', price: '399' },
      { number: '1100', price: '449' },
      { number: '1200', price: '499' },
      { number: '1300', price: '549' },
      { number: '1400', price: '599' },
      { number: '1500', price: '649' },
      { number: '1600', price: '699' },
      { number: '1700', price: '749' },
      { number: '1800', price: '799' },
      { number: '1900', price: '849' },
      { number: '2000', price: '899' },
      { number: '3000', price: '1399' },
      { number: '4000', price: '1899' },
    ],
  },
  {
    name: PlanEnum.BUSINESS,
    title: 'Business',
    text: 'For medium compagny',
    price: 399,
    listPrice: [
      { number: '100', price: '599' },
      { number: '200', price: '599' },
      { number: '300', price: '599' },
      { number: '400', price: '599' },
      { number: '500', price: '599' },
      { number: '600', price: '599' },
      { number: '700', price: '599' },
      { number: '800', price: '599' },
      { number: '900', price: '599' },
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
    listPrice: [],
  },
]

const PLAN_DEFAULT: PlanEnum = PlanEnum.FREE
const DEPLOY_DEFAULT: Value = DEPLOYS[0]

const DEFAULT_PRICE = {
  [PlanEnum.FREE]: { disable: false },
  [PlanEnum.PROFESSIONAL]: {
    number: PLANS.find((p) => p.name === PlanEnum.PROFESSIONAL)?.listPrice[0].number,
    disable: false,
  },
  [PlanEnum.BUSINESS]: { number: PLANS.find((p) => p.name === PlanEnum.BUSINESS)?.listPrice[0].number, disable: false },
  [PlanEnum.ENTERPRISE]: { disable: false },
}

export function OnboardingPricing() {
  useDocumentTitle('Onboarding Pricing - Qovery')

  const navigate = useNavigate()
  const { organization_name, project_name } = useContext(ContextOnboarding)
  const { createOrganization } = useOrganization()
  const { createProject } = useProjects()
  const { createAuthCookies } = useAuth()
  const [selectPlan, setSelectPlan] = useState(PLAN_DEFAULT)
  const [currentValue, setCurrentValue] = useState(DEFAULT_PRICE)
  const [currentDeploy, setCurrentDeploy] = useState(DEPLOY_DEFAULT)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (organization_name === '' && project_name === '') {
      navigate(`${ONBOARDING_URL}${ONBOARDING_PROJECT_URL}`)
    } else {
      navigate(`${ONBOARDING_URL}${ONBOARDING_PRICING_URL}/${selectPlan.toLowerCase()}`)
    }
  }, [selectPlan, navigate, organization_name, project_name])

  const chooseDeploy = (value: Value | null) => {
    if (value) {
      setCurrentDeploy(value)

      if (parseFloat(value.value) > 100) {
        setSelectPlan(PlanEnum.PROFESSIONAL)
        setCurrentValue({
          [PlanEnum.FREE]: { disable: true },
          [PlanEnum.PROFESSIONAL]: { number: value?.value, disable: false },
          [PlanEnum.BUSINESS]: { number: value?.value, disable: false },
          [PlanEnum.ENTERPRISE]: { disable: false },
        })
      } else {
        setCurrentValue({
          [PlanEnum.FREE]: { disable: false },
          [PlanEnum.PROFESSIONAL]: { number: value?.value, disable: false },
          [PlanEnum.BUSINESS]: { number: value?.value, disable: false },
          [PlanEnum.ENTERPRISE]: { disable: false },
        })
      }
    }
  }

  const onSubmit = async () => {
    setLoading(true)

    const organization = await createOrganization({
      name: organization_name,
      plan: selectPlan,
    })

    if (organization) {
      const project = await createProject(organization.id, {
        name: project_name,
      })

      if (project) {
        await createAuthCookies()
        setLoading(false)

        const url = `${process.env['NX_URL'] || 'https://console.qovery.com'}/organization/platform/${
          organization.id
        }/projects?redirectLoginV3`
        window.location.replace(url)
      }
    } else {
      setLoading(false)
    }
  }

  return (
    <StepPricing
      selectPlan={selectPlan}
      setSelectPlan={setSelectPlan}
      currentValue={currentValue}
      plans={PLANS}
      chooseDeploy={chooseDeploy}
      deploys={DEPLOYS}
      currentDeploy={currentDeploy}
      onSubmit={onSubmit}
      loading={loading}
    />
  )
}

export default OnboardingPricing
