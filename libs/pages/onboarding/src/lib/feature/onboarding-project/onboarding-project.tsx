import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useOrganizations } from '@qovery/domains/organizations/feature'
import { useAuth } from '@qovery/shared/auth'
import { ONBOARDING_PRICING_URL, ONBOARDING_URL } from '@qovery/shared/routes'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { StepProject } from '../../ui/step-project/step-project'
import { ContextOnboarding } from '../container/container'

export function OnboardingProject() {
  useDocumentTitle('Onboarding Organization - Qovery')

  const navigate = useNavigate()
  const { authLogout } = useAuth()
  const { handleSubmit, control, setValue } = useForm<{ project_name: string; organization_name: string }>()
  const { data: organizations = [] } = useOrganizations()
  const [backButton, setBackButton] = useState<boolean>()

  const { organization_name, project_name, admin_email, setContextValue } = useContext(ContextOnboarding)

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

  const onSubmit = handleSubmit((data) => {
    if (data) {
      const currentData = {
        organization_name: data.organization_name,
        project_name: data.project_name,
        admin_email,
      }
      setContextValue && setContextValue(currentData)
      navigate(`${ONBOARDING_URL}${ONBOARDING_PRICING_URL}`)
    }
  })

  return <StepProject onSubmit={onSubmit} control={control} authLogout={authLogout} backButton={backButton} />
}

export default OnboardingProject
