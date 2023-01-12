import { Dispatch, SetStateAction, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { postUserSignUp, selectUser, selectUserSignUp } from '@qovery/domains/user'
import { useAuth } from '@qovery/shared/auth'
import { ONBOARDING_MORE_URL, ONBOARDING_URL } from '@qovery/shared/routes'
import { AppDispatch } from '@qovery/store'
import { StepPersonalize } from '../../ui/step-personalize/step-personalize'

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

export interface FormUserProps {
  setStepCompany: Dispatch<SetStateAction<boolean>>
}

export function FormUser(props: FormUserProps) {
  const { setStepCompany } = props
  const navigate = useNavigate()
  const user = useSelector(selectUser)
  const userSignUp = useSelector(selectUserSignUp)
  const dispatch = useDispatch<AppDispatch>()
  const { authLogout } = useAuth()
  const { handleSubmit, control, setValue } = useForm()

  useEffect(() => {
    const { email, name } = user

    // adding default values by oAuth
    if (name && email) {
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

        await dispatch(
          postUserSignUp({
            ...userSignUp,
            ...data,
          })
        )
      } else {
        navigate(`${ONBOARDING_URL}${ONBOARDING_MORE_URL}`)

        const resetCompany = {
          company_name: undefined,
          company_size: undefined,
          user_role: undefined,
        }

        await dispatch(postUserSignUp({ ...userSignUp, ...data, ...resetCompany }))
      }
    }
  })

  return <StepPersonalize dataTypes={dataTypes} onSubmit={onSubmit} control={control} authLogout={authLogout} />
}

export default FormUser
