import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchOrganization, selectAllOrganization } from '@qovery/domains/organization'
import { useAuth } from '@qovery/shared/auth'
import { ONBOARDING_PRICING_URL, ONBOARDING_URL } from '@qovery/shared/routes'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch } from '@qovery/store'
import { StepProject } from '../../ui/step-project/step-project'
import { ContextOnboarding } from '../container/container'

export function OnboardingProject() {
  useDocumentTitle('Onboarding Organization - Qovery')

  const navigate = useNavigate()
  const { authLogout } = useAuth()
  const { handleSubmit, control, setValue } = useForm()
  const dispatch = useDispatch<AppDispatch>()
  const organizations = useSelector(selectAllOrganization)
  const [backButton, setBackButton] = useState<boolean | undefined>()

  const { organization_name, project_name, setContextValue } = useContext(ContextOnboarding)

  useEffect(() => {
    async function fetchOrganizations() {
      if (organizations.length === 0) {
        await dispatch(fetchOrganization())
          .unwrap()
          .then((result) => setBackButton(result.length > 0))
          .catch((e) => console.log(e))
      } else {
        setBackButton(true)
      }
    }
    fetchOrganizations()
  }, [organizations.length, dispatch])

  useEffect(() => {
    setValue('organization_name', organization_name)
    setValue('project_name', project_name || 'main')
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

  return <StepProject onSubmit={onSubmit} control={control} authLogout={authLogout} backButton={backButton} />
}

export default OnboardingProject
