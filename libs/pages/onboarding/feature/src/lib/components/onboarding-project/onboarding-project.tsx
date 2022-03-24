import { useContext, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { StepProject } from '@console/pages/onboarding/ui'
import { ONBOARDING_PRICING_URL, ONBOARDING_URL, useAuth, useDocumentTitle } from '@console/shared/utils'
import { ContextOnboarding } from '../container/container'

export function OnboardingProject() {
  useDocumentTitle('Onboarding Organization - Qovery')

  const navigate = useNavigate()
  const { authLogout } = useAuth()
  const { handleSubmit, control, setValue } = useForm()

  const { organization_name, project_name, setContextValue } = useContext(ContextOnboarding)

  useEffect(() => {
    setValue('organization_name', organization_name)
    setValue('project_name', project_name)
  }, [organization_name, project_name, setValue])

  const onSubmit = handleSubmit((data) => {
    if (data) {
      const currentData = {
        organization_name: data['organization_name'],
        project_name: data['project_name'],
      }
      setContextValue && setContextValue(currentData)
      navigate(`${ONBOARDING_URL}${ONBOARDING_PRICING_URL}`)
    }
  })

  return <StepProject onSubmit={onSubmit} control={control} authLogout={authLogout} />
}

export default OnboardingProject
