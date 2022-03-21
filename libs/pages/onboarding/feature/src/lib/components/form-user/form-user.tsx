import { Dispatch, SetStateAction, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { useUser } from '@console/domains/user'
import { StepPersonalize } from '@console/pages/onboarding/ui'
import { ONBOARDING_MORE_URL, ONBOARDING_URL, useAuth } from '@console/shared/utils'

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

interface FormUserProps {
  setStepCompany: Dispatch<SetStateAction<boolean>>
}

export function FormUser(props: FormUserProps) {
  const { setStepCompany } = props
  const navigate = useNavigate()
  const { user, userSignUp, updateUserSignUp } = useUser()
  const { authLogout } = useAuth()
  const { handleSubmit, control, setValue } = useForm()

  useEffect(() => {
    const { email, name } = user

    // adding default values by oAuth
    if (name && email && userSignUp) {
      setValue('first_name', userSignUp.first_name ? userSignUp.first_name : name?.split(' ')[0])
      setValue('last_name', userSignUp.last_name ? userSignUp.last_name : name?.split(' ')[1])
      setValue('user_email', userSignUp.user_email ? userSignUp.user_email : email)
      setValue('type_of_use', userSignUp.type_of_use)
    }
  }, [user, setValue, userSignUp])

  const onSubmit = handleSubmit(async (data) => {
    if (data) {
      const checkIfCompany = data['type_of_use'] === 'work'
      if (checkIfCompany) {
        setStepCompany(true)
        await updateUserSignUp({ ...userSignUp, ...data })
      } else {
        navigate(`${ONBOARDING_URL}${ONBOARDING_MORE_URL}`)

        const resetCompany = {
          company_name: undefined,
          company_size: undefined,
          user_role: undefined,
        }

        await updateUserSignUp({ ...userSignUp, ...data, ...resetCompany })
      }
    }
  })

  return <StepPersonalize dataTypes={dataTypes} onSubmit={onSubmit} control={control} authLogout={authLogout} />
}

export default FormUser
