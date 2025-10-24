import { useAuth0 } from '@auth0/auth0-react'
import { PlanEnum } from 'qovery-typescript-axios'
import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useCreateOrganization, useOrganizations } from '@qovery/domains/organizations/feature'
import { useCreateProject } from '@qovery/domains/projects/feature'
import { useAuth } from '@qovery/shared/auth'
import { ENVIRONMENTS_GENERAL_URL, ENVIRONMENTS_URL } from '@qovery/shared/routes'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { StepProject } from '../../ui/step-project/step-project'
import { ContextOnboarding } from '../container/container'

export function OnboardingProject() {
  useDocumentTitle('Onboarding Organization - Qovery')

  const navigate = useNavigate()
  const { user } = useAuth0()
  const { authLogout, getAccessTokenSilently } = useAuth()
  const { handleSubmit, control, setValue } = useForm<{ project_name: string; organization_name: string }>()
  const { data: organizations = [] } = useOrganizations()
  const [backButton, setBackButton] = useState<boolean>()
  const [loading, setLoading] = useState(false)

  const { organization_name, project_name, admin_email, setContextValue } = useContext(ContextOnboarding)
  const { mutateAsync: createOrganization } = useCreateOrganization()
  const { mutateAsync: createProject } = useCreateProject()

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
    if (data) {
      const currentData = {
        organization_name: data.organization_name,
        project_name: data.project_name,
        admin_email,
      }
      setContextValue && setContextValue(currentData)
      setLoading(true)

      try {
        // Create organization with Team plan by default
        const organization = await createOrganization({
          organizationRequest: {
            name: data.organization_name,
            plan: PlanEnum.TEAM,
            admin_emails: admin_email ? [admin_email] : user && user.email ? [user.email] : [],
          },
        })

        console.log('Organization created successfully:', organization.id)

        // Refresh token to get updated permissions for the new organization
        // This is critical because the JWT needs to include admin role for the new org ID
        try {
          await getAccessTokenSilently({ cacheMode: 'off' })
          console.log('Token refreshed successfully with new organization permissions')
        } catch (tokenError) {
          console.error('Token refresh failed:', tokenError)

          // If we get login_required error, it means Auth0 session is invalid
          // This can happen in dev environments with stale localStorage
          if (tokenError && typeof tokenError === 'object' && 'error' in tokenError && tokenError.error === 'login_required') {
            throw new Error(
              'Authentication session expired. Please clear your browser cache and log in again.'
            )
          }

          // For other errors, try without cache-busting option as fallback
          console.warn('Attempting project creation with cached token...')
        }

        // Create initial project with the refreshed token
        const project = await createProject({
          organizationId: organization.id,
          projectRequest: {
            name: data.project_name,
          },
        })

        console.log('Project created successfully:', project.id)

        // Redirect to the project page
        navigate(ENVIRONMENTS_URL(organization.id, project.id) + ENVIRONMENTS_GENERAL_URL)
      } catch (error) {
        console.error('Error creating organization or project:', error)
        // Log more details about the error
        if (error && typeof error === 'object') {
          console.error('Error details:', JSON.stringify(error, null, 2))
        }
      } finally {
        setLoading(false)
      }
    }
  })

  return <StepProject onSubmit={onSubmit} control={control} authLogout={authLogout} backButton={backButton} loading={loading} />
}

export default OnboardingProject
