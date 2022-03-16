import { Dispatch, SetStateAction, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { useUser } from '@console/domains/user'
import { StepCompany } from '@console/pages/onboarding/ui'
import { ONBOARDING_MORE_URL, ONBOARDING_URL } from '@console/shared/utils'

const dataSize = [
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

const dataRole = [
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

interface FormCompanyProps {
  setStepCompany: Dispatch<SetStateAction<boolean>>
}

export function FormCompany(props: FormCompanyProps) {
  const { setStepCompany } = props
  const navigate = useNavigate()
  const { userSignUp, updateUserSignUp } = useUser()
  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    if (userSignUp) {
      setValue('company_name', userSignUp?.company_name || undefined)
      setValue('company_size', userSignUp?.company_size || undefined)
      setValue('user_role', userSignUp?.user_role || undefined)
    }
  }, [setValue, userSignUp])

  const onSubmit = handleSubmit((data) => {
    if (data) {
      // submit data and the current step
      data = Object.assign(data, { current_step: ONBOARDING_MORE_URL })
      updateUserSignUp(data)
      navigate(`${ONBOARDING_URL}${ONBOARDING_MORE_URL}`)
    }
  })

  return (
    <StepCompany
      dataSize={dataSize}
      dataRole={dataRole}
      onSubmit={onSubmit}
      register={register}
      control={control}
      errors={errors}
      defaultValues={getValues()}
      setStepCompany={setStepCompany}
    />
  )
}

export default FormCompany
