import { Organization, PlanEnum, Project } from 'qovery-typescript-axios'
import { useContext, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { useIntercom } from 'react-use-intercom'
import {
  OrganizationPlan,
  OrganizationPlanType,
  OrganizationPrice,
  postOrganization,
} from '@qovery/domains/organization'
import { postProject } from '@qovery/domains/projects'
import { useAuth } from '@qovery/shared/auth'
import { ONBOARDING_PRICING_URL, ONBOARDING_PROJECT_URL, ONBOARDING_URL } from '@qovery/shared/router'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch } from '@qovery/store/data'
import { StepPricing } from '../../ui/step-pricing/step-pricing'
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
    listPrice: listPrice(49, false),
  },
  {
    name: PlanEnum.BUSINESS,
    title: 'Business',
    text: 'For medium company',
    price: 599,
    listPrice: listPrice(599, true),
  },
  {
    name: PlanEnum.ENTERPRISE,
    title: 'Enterprise',
    text: 'For large company',
    price: 0,
    listPrice: [],
  },
]

const PLAN_DEFAULT: PlanEnum = PlanEnum.FREE
const DEPLOY_DEFAULT = 100

const DEFAULT_PRICE = {
  [OrganizationPlanType.FREE]: { disable: false },
  [OrganizationPlanType.PROFESSIONAL]: {
    number: PLANS.find((p) => p.name === PlanEnum.PROFESSIONAL)?.listPrice[0].number,
    disable: false,
  },
  [OrganizationPlanType.BUSINESS]: {
    number: PLANS.find((p) => p.name === PlanEnum.BUSINESS)?.listPrice[0].number,
    disable: false,
  },
  [OrganizationPlanType.ENTERPRISE]: { disable: false },
}

export function OnboardingPricing() {
  useDocumentTitle('Onboarding Pricing - Qovery')

  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { showNewMessages } = useIntercom()
  const { organization_name, project_name } = useContext(ContextOnboarding)
  const { createAuthCookies, getAccessTokenSilently } = useAuth()
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
        if (selectPlan === PlanEnum.FREE) setSelectPlan(PlanEnum.PROFESSIONAL)

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

    const organization: Organization = await dispatch(
      postOrganization({
        name: organization_name,
        plan: selectPlan,
      })
    ).unwrap()
    // refresh token needed after created an organization
    await getAccessTokenSilently({ ignoreCache: true })

    if (organization) {
      const project: Project = await dispatch(
        postProject({ organizationId: organization.id, name: project_name })
      ).unwrap()

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
