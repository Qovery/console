import { type CompanySizeEnum } from 'qovery-typescript-axios'
import { type Dispatch, type SetStateAction } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useCreateUserSignUp, useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { type Value } from '@qovery/shared/interfaces'
import { ONBOARDING_MORE_URL, ONBOARDING_URL } from '@qovery/shared/routes'
import { StepCompany } from '../../ui/step-company/step-company'

const dataSize: Value[] = [
  {
    label: '1',
    value: '1',
  },
  {
    label: '2-10',
    value: '2-10',
  },
  {
    label: '11-50',
    value: '11-50',
  },
  {
    label: '51-200',
    value: '51-200',
  },
  {
    label: '201-500',
    value: '201-500',
  },
  {
    label: '501-999',
    value: '501-999',
  },
  {
    label: '1000+',
    value: '1000+',
  },
]

const dataRole: Value[] = [
  {
    label: 'DevOps',
    value: 'devops',
  },
  {
    label: 'Platform Engineer',
    value: 'platform-engineer',
  },
  {
    label: 'Tech Lead',
    value: 'tech-lead',
  },
  {
    label: 'Software Developer',
    value: 'software-developer',
  },
  {
    label: 'Engineering Manager',
    value: 'engineering-manager',
  },
  {
    label: 'VP Engineering',
    value: 'vp-engineering',
  },
  {
    label: 'CTO',
    value: 'cto',
  },
  {
    label: 'Product Manager',
    value: 'product-manager',
  },
  {
    label: 'Founder',
    value: 'founder',
  },
  {
    label: 'Other',
    value: 'other',
  },
]

export interface FormCompanyProps {
  setStepCompany: Dispatch<SetStateAction<boolean>>
}

export function FormCompany(props: FormCompanyProps) {
  const { setStepCompany } = props
  const navigate = useNavigate()
  const { data: userSignUp } = useUserSignUp()
  const { mutateAsync: createUserSignUp } = useCreateUserSignUp()

  const { handleSubmit, control } = useForm<{
    company_name?: string
    company_size?: CompanySizeEnum
    user_role?: string
  }>({
    defaultValues: {
      company_name: userSignUp?.company_name ?? undefined,
      company_size: userSignUp?.company_size ?? undefined,
      user_role: userSignUp?.user_role ?? undefined,
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    if (!userSignUp) return

    if (data) {
      try {
        await createUserSignUp({
          ...userSignUp,
          ...data,
        })
        navigate(`${ONBOARDING_URL}${ONBOARDING_MORE_URL}`)
      } catch (error) {
        console.error(error)
      }
    }
  })

  return (
    <StepCompany
      dataSize={dataSize}
      dataRole={dataRole}
      onSubmit={onSubmit}
      control={control}
      setStepCompany={setStepCompany}
    />
  )
}

export default FormCompany
