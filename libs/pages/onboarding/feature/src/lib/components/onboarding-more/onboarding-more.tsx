import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { StepMore } from '@console/pages/onboarding/ui'
import { ONBOARDING_THANKS_URL, ONBOARDING_URL } from '@console/shared/utils'
import { useUser } from '@console/domains/user'
import { useEffect } from 'react'

const dataQuestions = [
  {
    label: 'I want to easily deploy my apps on AWS',
    value: 'i-want-to-easily-deploy-my-apps-on-aws',
  },
  {
    label: 'I want to find a better alternative to Heroku',
    value: 'i-want-to-find-a-better-alternative-to-heroku',
  },
  {
    label: 'I want to get a faster AWS production-ready infrastructure',
    value: 'i-want-to-get-a-faster-aws-production-ready-infrastructure',
  },
  {
    label: 'I want to easily manage Preview Environments',
    value: 'i-want-to-easily-manage-preview-environments',
  },
  {
    label: 'Other',
    value: 'other',
  },
]

export function OnboardingMore() {
  const { handleSubmit, control, setValue } = useForm()
  const { userSignUp, updateUserSignUp } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    setValue('user_questions', userSignUp?.user_questions || undefined)
    setValue('qovery_usage', userSignUp?.qovery_usage || undefined)
  }, [setValue, userSignUp])

  const onSubmit = handleSubmit((data) => {
    if (data) {
      // submit data and the current step
      data = Object.assign(data, { current_step: ONBOARDING_THANKS_URL })

      updateUserSignUp({ ...userSignUp, ...data })
      navigate(`${ONBOARDING_URL}${ONBOARDING_THANKS_URL}`)
    }
  })

  return <StepMore dataQuestions={dataQuestions} control={control} onSubmit={onSubmit} />
}

export default OnboardingMore
