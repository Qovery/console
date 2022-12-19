import { Organization, PlanEnum, Project } from 'qovery-typescript-axios'
import { useContext, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useIntercom } from 'react-use-intercom'
import { postOrganization } from '@qovery/domains/organization'
import { postProject } from '@qovery/domains/projects'
import { useAuth } from '@qovery/shared/auth'
import { ENVIRONMENTS_GENERAL_URL, ENVIRONMENTS_URL } from '@qovery/shared/router'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch } from '@qovery/store'
import { StepPricing } from '../../ui/step-pricing/step-pricing'
import { ContextOnboarding } from '../container/container'

export interface OrganizationPlan {
  name: PlanEnum
  title: string
  text: string
  price: number
}

const PLANS: OrganizationPlan[] = [
  {
    name: PlanEnum.FREE,
    title: 'Free plan',
    text: 'Adapted for start',
    price: 0,
  },
  {
    name: PlanEnum.TEAM,
    title: 'Team plan',
    text: 'Adapted to scale',
    price: 49,
  },
  {
    name: PlanEnum.ENTERPRISE,
    title: 'Enterprise plan',
    text: 'Adapted for 100+ team',
    price: 899,
  },
]

export function OnboardingPricing() {
  useDocumentTitle('Onboarding Pricing - Qovery')

  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { showNewMessages } = useIntercom()
  const { organization_name, project_name } = useContext(ContextOnboarding)
  const { createAuthCookies, getAccessTokenSilently } = useAuth()
  const [selectPlan, setSelectPlan] = useState(PlanEnum.FREE)
  const [loading, setLoading] = useState(false)

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
        // redirect on the project page
        navigate(ENVIRONMENTS_URL(organization.id, project.id) + ENVIRONMENTS_GENERAL_URL)
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
      plans={PLANS}
      onSubmit={onSubmit}
      loading={loading}
      onClickContact={onClickContact}
    />
  )
}

export default OnboardingPricing
