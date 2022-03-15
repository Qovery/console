import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useUser } from '@console/domains/user'
import { StepPersonalize } from '@console/pages/onboarding/ui'
import { useDocumentTitle, ONBOARDING_PERSONALIZE_URL } from '@console/shared/utils'
import { FormPersonalize } from '@console/shared/interfaces'

const dataTypes = [
  {
    label: 'Personal',
    value: 'personal',
  },
  {
    label: 'Work',
    value: 'work',
  },
  {
    label: 'School',
    value: 'school',
  },
]

export function OnboardingPersonalize() {
  useDocumentTitle('Onboarding Personalize - Qovery')
  const { user, userSignUp, updateUserSignUp } = useUser()
  const { register, handleSubmit } = useForm()

  const defaultValue = useMemo(
    () => ({
      first_name: userSignUp.first_name || '',
      last_name: userSignUp.last_name || '',
      user_email: userSignUp.user_email || '',
    }),
    [userSignUp]
  )

  const [formData, setFormData] = useState<FormPersonalize>(defaultValue)

  useEffect(() => {
    const { email, name } = user

    if (formData.first_name === '') {
      setFormData({
        first_name: name?.split(' ')[0] || '',
        last_name: name?.split(' ')[1] || '',
        user_email: email || '',
      })
    } else {
      setFormData(defaultValue)
    }
  }, [user, defaultValue, formData.first_name])

  const onSubmit = handleSubmit((data) => {
    data = Object.assign(data, { current_step: ONBOARDING_PERSONALIZE_URL })
    updateUserSignUp(data)
  })

  if (formData.first_name.length > 0)
    return <StepPersonalize data={formData} dataTypes={dataTypes} onSubmit={onSubmit} register={register} />
  return null
}

export default OnboardingPersonalize
