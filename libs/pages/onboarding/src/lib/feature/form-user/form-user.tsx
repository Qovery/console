import { useAuth0 } from '@auth0/auth0-react'
import { type SignUpRequest, TypeOfUseEnum } from 'qovery-typescript-axios'
import { type Dispatch, type SetStateAction, useContext } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useCreateUserSignUp, useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { useAuth } from '@qovery/shared/auth'
import { ONBOARDING_MORE_URL, ONBOARDING_URL } from '@qovery/shared/routes'
import { StepPersonalize } from '../../ui/step-personalize/step-personalize'
import { ContextOnboarding } from '../container/container'

const dataTypes = [
  {
    label: 'Personal',
    value: TypeOfUseEnum.PERSONAL,
  },
  {
    label: 'Work',
    value: TypeOfUseEnum.WORK,
  },
  {
    label: 'School',
    value: TypeOfUseEnum.SCHOOL,
  },
]

export interface FormUserProps {
  setStepCompany: Dispatch<SetStateAction<boolean>>
}

export function FormUser(props: FormUserProps) {
  const { setStepCompany } = props
  const navigate = useNavigate()
  const { user } = useAuth0()
  const { authLogout } = useAuth()

  const { data: userSignUp } = useUserSignUp()
  const { mutateAsync: createUserSignUp } = useCreateUserSignUp()
  const { handleSubmit, control } = useForm<
    Pick<SignUpRequest, 'first_name' | 'last_name' | 'user_email' | 'type_of_use'>
  >({
    defaultValues: {
      first_name: userSignUp?.first_name ? userSignUp.first_name : user?.name?.split(' ')[0],
      last_name: userSignUp?.last_name ? userSignUp.last_name : user?.name?.split(' ')[1],
      user_email: userSignUp?.user_email ? userSignUp.user_email : user?.email,
      type_of_use: userSignUp?.type_of_use ?? TypeOfUseEnum.PERSONAL,
    },
  })
  const { organization_name, project_name, setContextValue } = useContext(ContextOnboarding)

  const onSubmit = handleSubmit(async (data) => {
    if (data) {
      const checkIfCompany = data['type_of_use'].toLowerCase() === TypeOfUseEnum.WORK
      if (checkIfCompany) {
        setStepCompany(true)

        await createUserSignUp({
          qovery_usage: userSignUp?.qovery_usage ?? '',
          ...userSignUp,
          ...data,
        })
      } else {
        navigate(`${ONBOARDING_URL}${ONBOARDING_MORE_URL}`)

        const resetCompany = {
          company_name: undefined,
          company_size: undefined,
          user_role: undefined,
        }

        setContextValue &&
          setContextValue({
            organization_name,
            project_name,
            admin_email: data['user_email'],
          })

        await createUserSignUp({
          qovery_usage: userSignUp?.qovery_usage ?? '',
          ...userSignUp,
          ...data,
          ...resetCompany,
        })
      }
    }
  })

  return <StepPersonalize dataTypes={dataTypes} onSubmit={onSubmit} control={control} authLogout={authLogout} />
}

export default FormUser
