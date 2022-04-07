import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router'
import { useIntercom } from 'react-use-intercom'
import { StepPricing } from '@console/pages/onboarding/ui'
import {
  OrganizationPlan,
  OrganizationPlanType,
  OrganizationPrice,
  useOrganization,
} from '@console/domains/organization'
import {
  ONBOARDING_PRICING_URL,
  ONBOARDING_PROJECT_URL,
  ONBOARDING_URL,
  useAuth,
  useDocumentTitle,
} from '@console/shared/utils'
import { useProjects } from '@console/domains/projects'
import { ContextOnboarding } from '../container/container'

function listPrice(base: number, isBusinessPlan?: boolean) {
  const results: OrganizationPrice[] = []
  let multiple = 0

  for (let i = 100; i <= 4000; i = i + 100) {
    const nbDeploy = isBusinessPlan ? 1000 : 300

    if (i > nbDeploy) multiple += 1
    const price = i > nbDeploy ? base + 50 * multiple : base
    results.push({
      number: i.toString(),
      price: price.toString(),
    })
  }
  return results
}

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
    listPrice: listPrice(49, false),
  },
  {
    name: OrganizationPlanType.BUSINESS,
    title: 'Business',
    text: 'For medium company',
    price: 599,
    listPrice: listPrice(599, true),
  },
  {
    name: OrganizationPlanType.ENTERPRISE,
    title: 'Enterprise',
    text: 'For large company',
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
        if (selectPlan === OrganizationPlanType.FREE) setSelectPlan(OrganizationPlanType.PROFESSIONAL)

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
