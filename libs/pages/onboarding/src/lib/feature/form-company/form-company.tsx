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
    label: '1-10',
    value: '1-10',
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
    label: '500+',
    value: '500+',
  },
]

const dataRole: Value[] = [
  {
    label: 'Tech Lead',
    value: 'tech-lead',
  },
  {
    label: 'Software Developer',
    value: 'software-developer',
  },
  {
    label: 'DevOps',
    value: 'devops',
  },
  {
    label: 'Product/Project Manager',
    value: 'product-project-manager',
  },
  {
    label: 'CTO',
    value: 'cto',
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
  const { handleSubmit, control, setValue } = useForm()

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
