import { useAuth0 } from '@auth0/auth0-react'
import { TypeOfUseEnum } from 'qovery-typescript-axios'
import { type Dispatch, type SetStateAction, useContext } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useCreateUserSignUp, useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { useAuth } from '@qovery/shared/auth'
import { IconEnum } from '@qovery/shared/enums'
import { ONBOARDING_MORE_URL, ONBOARDING_URL } from '@qovery/shared/routes'
import { Icon } from '@qovery/shared/ui'
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

const dataCloudProviders = [
  {
    label: 'Amazon Web Service (AWS)',
    value: 'AWS',
    icon: <Icon width={16} height={16} name={IconEnum.AWS} />,
  },
  {
    label: 'Google Cloud Patform (GCP)',
    value: 'GCP',
    icon: <Icon width={16} height={16} name={IconEnum.GCP} />,
  },
  {
    label: 'Scaleway',
    value: 'SCW',
    icon: <Icon width={16} height={16} name={IconEnum.SCW} />,
  },
  {
    label: 'Azure',
    value: 'AZURE',
    icon: <Icon width={16} height={16} name={IconEnum.AZURE} />,
  },
  {
    label: 'Other',
    value: 'OTHER',
    icon: <Icon className="text-xs text-neutral-500" iconName="cloud" iconStyle="regular" />,
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

  const { handleSubmit, control } = useForm<{
    first_name: string
    last_name: string
    user_email: string
    type_of_use: TypeOfUseEnum
    infrastructure_hosting: string
  }>({
    defaultValues: {
      first_name: userSignUp?.first_name ? userSignUp.first_name : user?.name?.split(' ')[0],
      last_name: userSignUp?.last_name ? userSignUp.last_name : user?.name?.split(' ')[1],
      user_email: userSignUp?.user_email ? userSignUp.user_email : user?.email,
      type_of_use: userSignUp?.type_of_use ?? TypeOfUseEnum.PERSONAL,
      infrastructure_hosting: userSignUp?.infrastructure_hosting ?? 'AWS',
    },
  })
  const { organization_name, project_name, setContextValue } = useContext(ContextOnboarding)

  const onSubmit = handleSubmit(async (data) => {
    if (data) {
      const checkIfCompany = data['type_of_use'] === TypeOfUseEnum.WORK

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

  return (
    <StepPersonalize
      dataTypes={dataTypes}
      dataCloudProviders={dataCloudProviders}
      onSubmit={onSubmit}
      control={control}
      authLogout={authLogout}
    />
  )
}

export default FormUser
