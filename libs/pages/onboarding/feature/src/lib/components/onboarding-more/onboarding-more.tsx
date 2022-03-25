import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { StepMore } from '@console/pages/onboarding/ui'
import { ONBOARDING_THANKS_URL, ONBOARDING_URL, useDocumentTitle } from '@console/shared/utils'
import { useUser } from '@console/domains/user'
import { Value } from '@console/shared/interfaces'

const dataQuestions: Value[] = [
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
  useDocumentTitle('Onboarding Tell us more - Qovery')
  const { handleSubmit, control, setValue, watch } = useForm()
  const { userSignUp, updateUserSignUp } = useUser()
  const navigate = useNavigate()

  const displayQoveryUsageOther = watch('qovery_usage') === 'other'

  useEffect(() => {
    setValue('user_questions', userSignUp?.user_questions || undefined)
    setValue('qovery_usage', userSignUp?.qovery_usage || undefined)
    setValue('qovery_usage_other', userSignUp?.qovery_usage_other || undefined)
  }, [setValue, userSignUp])

  const onSubmit = handleSubmit((data) => {
    if (data) {
      // reset qovery usage other
      if (data['qovery_usage'] !== 'other') {
        data['qovery_usage_other'] = null
      }

      updateUserSignUp({ ...userSignUp, ...data })
      navigate(`${ONBOARDING_URL}${ONBOARDING_THANKS_URL}`)
    }
  })

  return (
    <StepMore
      dataQuestions={dataQuestions}
      control={control}
      onSubmit={onSubmit}
      displayQoveryUsageOther={displayQoveryUsageOther}
    />
  )
}

export default OnboardingMore
