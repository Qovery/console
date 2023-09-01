import { type SignUp } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchUserSignUp, postUserSignUp, selectUserSignUp } from '@qovery/domains/users/data-access'
import { type Value } from '@qovery/shared/interfaces'
import { ONBOARDING_PROJECT_URL, ONBOARDING_THANKS_URL, ONBOARDING_URL } from '@qovery/shared/routes'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { type AppDispatch } from '@qovery/state/store'
import { StepMore } from '../../ui/step-more/step-more'

const dataQuestions: Value[] = [
  {
    label: 'easily spin up testing/dev/QA environments',
    value: 'i-want-to-easily-spin-up-testing-dev-qa-environments',
  },
  {
    label: 'SIMPLIFY my deployment pipeline',
    value: 'i-want-to-simplify-my-deployment-pipeline',
  },
  {
    label: 'AUTOMATE my deployment pipeline',
    value: 'i-want-to-automate-my-deployment-pipeline',
  },
  {
    label: 'easily deploy my new project',
    value: 'i-want-to-easily-deploy-my-new-project',
  },
  {
    label: 'easily migrate my apps from Heroku',
    value: 'i-want-to-easily-migrate-my-apps-from-heroku',
  },
  {
    label: 'find a better alternative to Heroku',
    value: 'i-want-to-find-a-better-alternative-to-heroku',
  },
  {
    label: 'easily spin up and manage my Kubernetes cluster',
    value: 'i-want-to-easily-spin-up-and-manage-my-kubernetes-cluster',
  },
  {
    label: 'easily deploy my apps on my Kubernetes cluster',
    value: 'i-want-to-easily-deploy-my-apps-on-my-kubernetes-cluster',
  },
  {
    label: 'Other',
    value: 'other',
  },
]

export function OnboardingMore() {
  useDocumentTitle('Onboarding Tell us more - Qovery')
  const { handleSubmit, control, setValue, watch } = useForm<{
    user_questions?: string
    qovery_usage: string
    qovery_usage_other?: string
    where_to_deploy?: string
  }>()
  const userSignUp = useSelector(selectUserSignUp)
  const dispatch = useDispatch<AppDispatch>()

  const navigate = useNavigate()

  const displayQoveryUsageOther = watch('qovery_usage') === 'other'

  useEffect(() => {
    setValue('user_questions', userSignUp?.user_questions || undefined)
    setValue('qovery_usage', userSignUp.qovery_usage)
    setValue('qovery_usage_other', userSignUp?.qovery_usage_other || undefined)
    setValue('where_to_deploy', userSignUp?.qovery_usage_other || undefined)
  }, [setValue, userSignUp])

  const onSubmit = handleSubmit(async (data) => {
    if (data) {
      // reset qovery usage other
      if (data['qovery_usage'] !== 'other') {
        delete data['qovery_usage_other']
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
