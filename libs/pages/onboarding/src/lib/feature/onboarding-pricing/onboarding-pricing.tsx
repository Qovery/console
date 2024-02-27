import { useAuth0 } from '@auth0/auth0-react'
import { PlanEnum } from 'qovery-typescript-axios'
import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIntercom } from 'react-use-intercom'
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
  price: number
  list: string[]
}

const PLANS: OrganizationPlan[] = [
  {
    name: PlanEnum.FREE,
    title: 'Free plan',
    text: 'Free Forever. No CC required',
    price: 0,
    list: [
      'Deploy on your cluster',
      'Up to 25 users',
      'Up to 3 Self-Managed clusters',
      'Up to 20 services',
      '1,000 free deployment minutes',
      'Community support',
    ],
  },
  {
    name: PlanEnum.TEAM,
    title: 'Team plan',
    text: 'Ideal for teams',
    price: 29,
    list: [
      'All FREE features',
      'Up to 100 users',
      'Up to 5 Self-Managed clusters',
      'Up to 200 services',
      '1,000 free deployment minutes',
      '24/5 support (email and chat)',
    ],
  },
  {
    name: PlanEnum.ENTERPRISE,
    title: 'Enterprise plan',
    text: 'Tailored for your organization',
    price: 899,
    list: [
      'All TEAM features',
      'Custom limits',
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
  const { showNewMessage } = useIntercom()
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
          plan: plan,
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

  const onClickContact = () => showNewMessage()

  return <StepPricing plans={PLANS} onSubmit={onSubmit} loading={loading} onClickContact={onClickContact} />
}

export default OnboardingPricing
