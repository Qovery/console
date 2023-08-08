import { CompanySizeEnum } from 'qovery-typescript-axios'
import { Dispatch, SetStateAction, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { postUserSignUp, selectUserSignUp } from '@qovery/domains/user'
import { Value } from '@qovery/shared/interfaces'
import { ONBOARDING_MORE_URL, ONBOARDING_URL } from '@qovery/shared/routes'
import { AppDispatch } from '@qovery/store'
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
  const dispatch = useDispatch<AppDispatch>()
  const userSignUp = useSelector(selectUserSignUp)
  const { handleSubmit, control, setValue } = useForm<{
    company_name?: string
    company_size?: CompanySizeEnum
    user_role?: string
  }>()

  useEffect(() => {
    setValue('company_name', userSignUp?.company_name || undefined)
    setValue('company_size', userSignUp?.company_size || undefined)
    setValue('user_role', userSignUp?.user_role || undefined)
  }, [setValue, userSignUp])

  const onSubmit = handleSubmit((data) => {
    if (data) {
      dispatch(
        postUserSignUp({
          ...userSignUp,
          ...data,
        })
      )
      navigate(`${ONBOARDING_URL}${ONBOARDING_MORE_URL}`)
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
