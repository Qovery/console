import { useAuth0 } from '@auth0/auth0-react'
import { TypeOfUseEnum } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useCreateUserSignUp, useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { useAuth } from '@qovery/shared/auth'
import { IconEnum } from '@qovery/shared/enums'
import { ONBOARDING_PLANS_URL, ONBOARDING_PROJECT_URL, ONBOARDING_URL } from '@qovery/shared/routes'
import { Icon } from '@qovery/shared/ui'
import { StepPersonalize } from '../../ui/step-personalize/step-personalize'

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

const dataQoveryUsage = [
  {
    label: 'Spin up testing/dev/QA environments',
    value: 'i-want-to-easily-spin-up-testing-dev-qa-environments',
  },
  {
    label: 'Simplify my deployment pipeline',
    value: 'i-want-to-simplify-my-deployment-pipeline',
  },
  {
    label: 'Automate my deployment pipeline',
    value: 'i-want-to-automate-my-deployment-pipeline',
  },
  {
    label: 'Deploy my new project',
    value: 'i-want-to-easily-deploy-my-new-project',
  },
  {
    label: 'Migrate my apps from Heroku',
    value: 'i-want-to-easily-migrate-my-apps-from-heroku',
  },
  {
    label: 'Find a better alternative to Heroku',
    value: 'i-want-to-find-a-better-alternative-to-heroku',
  },
  {
    label: 'Spin up and manage my Kubernetes cluster',
    value: 'i-want-to-easily-spin-up-and-manage-my-kubernetes-cluster',
  },
  {
    label: 'Deploy my apps on my Kubernetes cluster',
    value: 'i-want-to-easily-deploy-my-apps-on-my-kubernetes-cluster',
  },
  {
    label: 'Other',
    value: 'other',
  },
]

export function FormUser() {
  const navigate = useNavigate()
  const { user } = useAuth0()
  const { authLogout } = useAuth()

  const { data: userSignUp } = useUserSignUp()
  const { mutateAsync: createUserSignUp } = useCreateUserSignUp()

  const methods = useForm<{
    first_name: string
    last_name: string
    user_email: string
    company_name?: string
    qovery_usage: string
    qovery_usage_other?: string
    type_of_use: TypeOfUseEnum
    infrastructure_hosting: string
  }>({
    mode: 'onChange',
    defaultValues: {
      first_name: userSignUp?.first_name ? userSignUp.first_name : user?.name?.split(' ')[0],
      last_name: userSignUp?.last_name ? userSignUp.last_name : user?.name?.split(' ')[1],
      user_email: userSignUp?.user_email ? userSignUp.user_email : user?.email,
      company_name: userSignUp?.company_name ?? '',
      qovery_usage: userSignUp?.qovery_usage ?? undefined,
      qovery_usage_other: userSignUp?.qovery_usage_other ?? undefined,
      type_of_use: userSignUp?.type_of_use ?? TypeOfUseEnum.WORK,
      infrastructure_hosting: userSignUp?.infrastructure_hosting ?? 'AWS',
    },
  })

  const onSubmit = methods.handleSubmit(async (data) => {
    if (!data) return

    const normalizedData = { ...data }

    if (normalizedData.qovery_usage !== 'other') {
      delete normalizedData.qovery_usage_other
    }

    try {
      await createUserSignUp({
        ...userSignUp,
        ...normalizedData,
      })
      const nextStep = userSignUp?.dx_auth ? ONBOARDING_PROJECT_URL : ONBOARDING_PLANS_URL
      navigate(`${ONBOARDING_URL}${nextStep}`)
    } catch (error) {
      console.error(error)
    }
  })

  return (
    <FormProvider {...methods}>
      <StepPersonalize
        dataCloudProviders={dataCloudProviders}
        dataQoveryUsage={dataQoveryUsage}
        onSubmit={onSubmit}
        authLogout={authLogout}
      />
    </FormProvider>
  )
}

export default FormUser
