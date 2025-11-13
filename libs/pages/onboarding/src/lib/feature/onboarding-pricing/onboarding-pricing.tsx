import { useAuth0 } from '@auth0/auth0-react'
import { PlanEnum } from 'qovery-typescript-axios'
import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateOrganization } from '@qovery/domains/organizations/feature'
import { useCreateProject } from '@qovery/domains/projects/feature'
import { useAuth } from '@qovery/shared/auth'
import { ENVIRONMENTS_GENERAL_URL, ENVIRONMENTS_URL } from '@qovery/shared/routes'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { StepPricing } from '../../ui/step-pricing/step-pricing'
import { ContextOnboarding } from '../container/container'

export interface OrganizationPlan {
  name: PlanEnum
  title: string
  text: string
  price: number | 'custom'
  list: string[]
}

const PLANS: OrganizationPlan[] = [
  {
    name: PlanEnum.USER_2025,
    title: 'User plan',
    text: 'Perfect for small team',
    price: 299,
    list: [
      'Deploy on your own cloud',
      'Include 2 users',
      'Include 1 managed cluster',
      'Include 1000 deployment minutes',
      'Standard support',
    ],
  },
  {
    name: PlanEnum.TEAM_2025,
    title: 'Team plan',
    text: 'Ideal for teams',
    price: 899,
    list: [
      'Deploy on your own cloud',
      'Include 10 users',
      'Include 2 managed cluster',
      'Include 5000 deployment minutes',
      'Standard support',
    ],
  },
  {
    name: PlanEnum.BUSINESS_2025,
    title: 'Business plan',
    text: 'For growing businesses',
    price: 2099,
    list: [
      'Deploy on your own cloud',
      'Include 30 users',
      'Include 3 managed cluster',
      'Include 10000 deployment minutes',
      'Business support with SLAs',
    ],
  },
  {
    name: PlanEnum.ENTERPRISE_2025,
    title: 'Enterprise plan',
    text: 'Tailored for your organization',
    price: 'custom',
    list: ['All BUSINESS features', 'Deploy on-premise or private cloud', 'Custom limits', 'Custom support'],
  },
]

export function OnboardingPricing() {
  useDocumentTitle('Onboarding Pricing - Qovery')

  const navigate = useNavigate()
  const { user } = useAuth0()
  const { organization_name, project_name, admin_email } = useContext(ContextOnboarding)
  const { getAccessTokenSilently } = useAuth()
  const [loading, setLoading] = useState('')
  const { mutateAsync: createOrganization } = useCreateOrganization()
  const { mutateAsync: createProject } = useCreateProject()

  const onSubmit = async (plan: PlanEnum) => {
    setLoading(plan)

    try {
      const organization = await createOrganization({
        organizationRequest: {
          name: organization_name,
          plan,
          admin_emails: admin_email ? [admin_email] : user && user.email ? [user.email] : [],
        },
      })

      // refresh token needed after created an organization
      await getAccessTokenSilently({ cacheMode: 'off' })

      const project = await createProject({
        organizationId: organization.id,
        projectRequest: {
          name: project_name,
        },
      })
      if (project) {
        // redirect on the project page
        navigate(ENVIRONMENTS_URL(organization.id, project.id) + ENVIRONMENTS_GENERAL_URL)
      }
    } catch (error) {
      console.error(error)
    }

    setLoading('')
  }

  return <StepPricing plans={PLANS} onSubmit={onSubmit} loading={loading} />
}

export default OnboardingPricing
