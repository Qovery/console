import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { useOrganizations, useCreateOrganization } from '@qovery/domains/organizations/feature'
import { useCreateProject } from '@qovery/domains/projects/feature'
import { useAuth } from '@qovery/shared/auth'
import { ENVIRONMENTS_GENERAL_URL, ENVIRONMENTS_URL, ONBOARDING_MORE_URL, ONBOARDING_URL } from '@qovery/shared/routes'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { StepProject } from '../../ui/step-project/step-project'
import { ContextOnboarding } from '../container/container'

export function OnboardingProject() {
  useDocumentTitle('Onboarding Organization - Qovery')

  const navigate = useNavigate()
  const { user } = useAuth0()
  const { authLogout, getAccessTokenSilently } = useAuth()
  const { mutateAsync: createOrganization } = useCreateOrganization()
  const { mutateAsync: createProject } = useCreateProject()
  const { handleSubmit, control, setValue } = useForm<{ project_name: string; organization_name: string }>()
  const { data: organizations = [] } = useOrganizations()
  const [backButton, setBackButton] = useState<boolean>()

  const { organization_name, project_name, admin_email, selectedPlan, setContextValue } = useContext(ContextOnboarding)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function fetchOrganizations() {
      if (organizations.length === 0) {
        setBackButton(false)
      } else {
        setBackButton(true)
      }
    }
    fetchOrganizations()
  }, [organizations])

  useEffect(() => {
    setValue('organization_name', organization_name)
    setValue('project_name', project_name || 'main')
  }, [organization_name, project_name, setValue])

  const onSubmit = handleSubmit(async (data) => {
    if (!data) return

    const currentData = {
      organization_name: data.organization_name,
      project_name: data.project_name,
      admin_email,
    }
    setContextValue && setContextValue(currentData)

    setIsSubmitting(true)
    try {
      const organization = await createOrganization({
        organizationRequest: {
          name: data.organization_name,
          plan: selectedPlan,
          admin_emails: admin_email ? [admin_email] : user?.email ? [user.email] : [],
        },
      })
      await getAccessTokenSilently({ cacheMode: 'off' })
      const project = await createProject({
        organizationId: organization.id,
        projectRequest: {
          name: data.project_name,
        },
      })

      if (project) {
        navigate(ENVIRONMENTS_URL(organization.id, project.id) + ENVIRONMENTS_GENERAL_URL)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  })

  const handleFirstStepBack = () => {
    navigate(`${ONBOARDING_URL}${ONBOARDING_MORE_URL}`)
  }

  return (
    <StepProject
      onSubmit={onSubmit}
      control={control}
      authLogout={authLogout}
      backButton={backButton}
      loading={isSubmitting}
      onFirstStepBack={!backButton ? handleFirstStepBack : undefined}
    />
  )
}

export default OnboardingProject
