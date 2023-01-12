import { SignUp } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchUserSignUp, postUserSignUp, selectUserSignUp } from '@qovery/domains/user'
import { Value } from '@qovery/shared/interfaces'
import { ONBOARDING_PROJECT_URL, ONBOARDING_THANKS_URL, ONBOARDING_URL } from '@qovery/shared/routes'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch } from '@qovery/store'
import { StepMore } from '../../ui/step-more/step-more'

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
  const userSignUp = useSelector(selectUserSignUp)
  const dispatch = useDispatch<AppDispatch>()

  const navigate = useNavigate()

  const displayQoveryUsageOther = watch('qovery_usage') === 'other'

  useEffect(() => {
    setValue('user_questions', userSignUp?.user_questions || undefined)
    setValue('qovery_usage', userSignUp?.qovery_usage || undefined)
    setValue('qovery_usage_other', userSignUp?.qovery_usage_other || undefined)
  }, [setValue, userSignUp])

  const onSubmit = handleSubmit(async (data) => {
    if (data) {
      // reset qovery usage other
      if (data['qovery_usage'] !== 'other') {
        data['qovery_usage_other'] = null
      }

      await dispatch(postUserSignUp({ ...userSignUp, ...data }))

      const user: SignUp = await dispatch(fetchUserSignUp()).unwrap()

      if (user.dx_auth) {
        navigate(`${ONBOARDING_URL}${ONBOARDING_PROJECT_URL}`)
      } else if (!user.dx_auth) {
        // redirect to Thanks page if user not authorized by the dx team
        // dx_auth must be updated in the bdd
        navigate(`${ONBOARDING_URL}${ONBOARDING_THANKS_URL}`)
      }
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
