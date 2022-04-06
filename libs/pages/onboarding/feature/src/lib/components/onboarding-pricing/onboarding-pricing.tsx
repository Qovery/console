import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router'
import { useIntercom } from 'react-use-intercom'
import { StepPricing } from '@console/pages/onboarding/ui'
import { OrganizationPlan, OrganizationPlanType, useOrganization } from '@console/domains/organization'
import {
  ONBOARDING_PRICING_URL,
  ONBOARDING_PROJECT_URL,
  ONBOARDING_URL,
  useAuth,
  useDocumentTitle,
} from '@console/shared/utils'
import { useProjects } from '@console/domains/projects'
import { ContextOnboarding } from '../container/container'

const PLANS: OrganizationPlan[] = [
  {
    name: OrganizationPlanType.FREE,
    title: 'Free',
    text: 'Adapted for personnal project',
    price: 0,
    listPrice: [],
  },
  {
    name: OrganizationPlanType.PROFESSIONAL,
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
      { number: '2100', price: '1399' },
      { number: '2200', price: '1399' },
      { number: '2300', price: '1399' },
      { number: '2400', price: '1399' },
      { number: '2500', price: '1399' },
      { number: '2600', price: '1399' },
      { number: '2700', price: '1399' },
      { number: '2800', price: '1399' },
      { number: '2900', price: '1399' },
      { number: '3000', price: '1399' },
      { number: '3100', price: '1899' },
      { number: '3200', price: '1899' },
      { number: '3300', price: '1899' },
      { number: '3400', price: '1899' },
      { number: '3500', price: '1899' },
      { number: '3600', price: '1899' },
      { number: '3700', price: '1899' },
      { number: '3800', price: '1899' },
      { number: '3900', price: '1899' },
      { number: '4000', price: '1899' },
    ],
  },
  {
    name: OrganizationPlanType.BUSINESS,
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
      { number: '2100', price: '1599' },
      { number: '2200', price: '1599' },
      { number: '2300', price: '1599' },
      { number: '2400', price: '1599' },
      { number: '2500', price: '1599' },
      { number: '2600', price: '1599' },
      { number: '2700', price: '1599' },
      { number: '2800', price: '1599' },
      { number: '2900', price: '1599' },
      { number: '3000', price: '1599' },
      { number: '3100', price: '2099' },
      { number: '3200', price: '2099' },
      { number: '3300', price: '2099' },
      { number: '3400', price: '2099' },
      { number: '3500', price: '2099' },
      { number: '3600', price: '2099' },
      { number: '3700', price: '2099' },
      { number: '3800', price: '2099' },
      { number: '3900', price: '2099' },
      { number: '4000', price: '2099' },
    ],
  },
  {
    name: OrganizationPlanType.ENTERPRISE,
    title: 'Enterprise',
    text: 'For large compagny',
    price: 0,
    listPrice: [],
  },
]

const PLAN_DEFAULT: OrganizationPlanType = OrganizationPlanType.FREE
const DEPLOY_DEFAULT = 100

const DEFAULT_PRICE = {
  [OrganizationPlanType.FREE]: { disable: false },
  [OrganizationPlanType.PROFESSIONAL]: {
    number: PLANS.find((p) => p.name === OrganizationPlanType.PROFESSIONAL)?.listPrice[0].number,
    disable: false,
  },
  [OrganizationPlanType.BUSINESS]: {
    number: PLANS.find((p) => p.name === OrganizationPlanType.BUSINESS)?.listPrice[0].number,
    disable: false,
  },
  [OrganizationPlanType.ENTERPRISE]: { disable: false },
}

export function OnboardingPricing() {
  useDocumentTitle('Onboarding Pricing - Qovery')

  const navigate = useNavigate()
  const { showNewMessages } = useIntercom()
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

  const chooseDeploy = (value: number | null) => {
    if (value) {
      setCurrentDeploy(value)

      if (value > 100) {
        setSelectPlan(OrganizationPlanType.PROFESSIONAL)
        setCurrentValue({
          [OrganizationPlanType.FREE]: { disable: true },
          [OrganizationPlanType.PROFESSIONAL]: { number: value.toString(), disable: false },
          [OrganizationPlanType.BUSINESS]: { number: value.toString(), disable: false },
          [OrganizationPlanType.ENTERPRISE]: { disable: false },
        })
      } else {
        setCurrentValue({
          [OrganizationPlanType.FREE]: { disable: false },
          [OrganizationPlanType.PROFESSIONAL]: { number: value.toString(), disable: false },
          [OrganizationPlanType.BUSINESS]: { number: value.toString(), disable: false },
          [OrganizationPlanType.ENTERPRISE]: { disable: false },
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

        setTimeout(() => {
          const url = `${process.env['NX_URL'] || 'https://console.qovery.com'}?redirectLoginV3`
          window.location.replace(url)
        }, 500)
      }
    } else {
      setLoading(false)
    }
  }

  const onClickContact = () => showNewMessages()

  return (
    <StepPricing
      selectPlan={selectPlan}
      setSelectPlan={setSelectPlan}
      currentValue={currentValue}
      plans={PLANS}
      chooseDeploy={chooseDeploy}
      currentDeploy={currentDeploy}
      onSubmit={onSubmit}
      loading={loading}
      onClickContact={onClickContact}
    />
  )
}

export default OnboardingPricing
