import { Organization, PlanEnum, Project } from 'qovery-typescript-axios'
import { useContext, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useIntercom } from 'react-use-intercom'
import { postOrganization } from '@qovery/domains/organization'
import { postProject } from '@qovery/domains/projects'
import { useAuth } from '@qovery/shared/auth'
import { ENVIRONMENTS_GENERAL_URL, ENVIRONMENTS_URL } from '@qovery/shared/routes'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch } from '@qovery/store'
import { StepPricing } from '../../ui/step-pricing/step-pricing'
import { ContextOnboarding } from '../container/container'

export interface OrganizationPlan {
  name: PlanEnum
  title: string
  text: string
  price: number
  list: string[]
}

const PLANS: OrganizationPlan[] = [
  {
    name: PlanEnum.FREE,
    title: 'Free plan',
    text: 'Adapted for start',
    price: 0,
    list: [
      'Deploy on your AWS account',
      'Unlimited Developers',
      'Up to 1 cluster',
      'Up to 5 Environments',
      'Preview Environment in one-click',
      'Community support (forum)',
    ],
  },
  {
    name: PlanEnum.TEAM,
    title: 'Team plan',
    text: 'Adapted to scale',
    price: 49,
    list: [
      'All FREE features',
      'Up to 3 clusters',
      'Unlimited Deployments',
      'Unlimited Environments',
      '24/5 support (email and chat)',
    ],
  },
  {
    name: PlanEnum.ENTERPRISE,
    title: 'Enterprise plan',
    text: 'Adapted for 100+ team',
    price: 899,
    list: [
      'All TEAM features',
      'Unlimited Clusters',
      'Role-Based Access Control',
      'Extended security and compliance',
      'Usage Report',
      'Custom support',
    ],
  },
]

export function OnboardingPricing() {
  useDocumentTitle('Onboarding Pricing - Qovery')

  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { showNewMessages } = useIntercom()
  const { organization_name, project_name } = useContext(ContextOnboarding)
  const { createAuthCookies, getAccessTokenSilently } = useAuth()
  const [loading, setLoading] = useState('')

  const onSubmit = async (plan: PlanEnum) => {
    setLoading(plan)

    await dispatch(
      postOrganization({
        name: organization_name,
        plan: plan,
      })
    )
      .then(async (result) => {
        // refresh token needed after created an organization
        await getAccessTokenSilently({ ignoreCache: true })

        const organization = result.payload as Organization

        if (result.payload) {
          const project: Project = await dispatch(
            postProject({ organizationId: organization.id, name: project_name })
          ).unwrap()
          if (project) {
            await createAuthCookies()
            setLoading('')
            // redirect on the project page
            navigate(ENVIRONMENTS_URL(organization.id, project.id) + ENVIRONMENTS_GENERAL_URL)
          }
        } else {
          setLoading('')
        }
      })
      .catch(() => setLoading(''))
  }

  const onClickContact = () => showNewMessages()

  return <StepPricing plans={PLANS} onSubmit={onSubmit} loading={loading} onClickContact={onClickContact} />
}

export default OnboardingPricing
