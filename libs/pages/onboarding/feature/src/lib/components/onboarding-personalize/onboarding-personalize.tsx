import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { useUser } from '@console/domains/user'
import { StepPersonalize } from '@console/pages/onboarding/ui'
import {
  useDocumentTitle,
  ONBOARDING_PERSONALIZE_URL,
  ONBOARDING_COMPANY_URL,
  ONBOARDING_URL,
  ONBOARDING_MORE_URL,
} from '@console/shared/utils'

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
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    const { email, name } = user

    // adding default values by oAuth
    if (name && email && userSignUp) {
      setValue('first_name', name?.split(' ')[0])
      setValue('last_name', name?.split(' ')[1])
      setValue('user_email', email)
      setValue('type_of_use', userSignUp.type_of_use)
    }
  }, [user, setValue, userSignUp])

  const onSubmit = handleSubmit((data) => {
    if (data) {
      const checkIfCompany = data['type_of_use'] === 'work'
      // submit data and the current step
      data = Object.assign(data, { current_step: ONBOARDING_PERSONALIZE_URL })
      updateUserSignUp(data)

      if (checkIfCompany) {
        navigate(`${ONBOARDING_URL}${ONBOARDING_COMPANY_URL}`)
      } else {
        navigate(`${ONBOARDING_URL}${ONBOARDING_MORE_URL}`)
      }
    }
  })

  return (
    <StepPersonalize
      dataTypes={dataTypes}
      onSubmit={onSubmit}
      register={register}
      control={control}
      errors={errors}
      defaultValues={getValues()}
    />
  )
}

export default OnboardingPersonalize
