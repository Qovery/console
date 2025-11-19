import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useCreateUserSignUp, useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { ONBOARDING_PROJECT_URL, ONBOARDING_THANKS_URL, ONBOARDING_URL } from '@qovery/shared/routes'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { StepMore } from '../../ui/step-more/step-more'

export function OnboardingMore() {
  useDocumentTitle('Onboarding Tell us more - Qovery')

  const { data: userSignUp, refetch: refetchUserSignUp } = useUserSignUp()
  const { mutateAsync: createUserSignUp } = useCreateUserSignUp()

  const { handleSubmit, control } = useForm<{
    user_questions?: string
  }>({
    defaultValues: {
      user_questions: userSignUp?.user_questions ?? undefined,
    },
  })
  const navigate = useNavigate()

  const onSubmit = handleSubmit(async (data) => {
    if (!userSignUp) return

    if (data) {
      try {
        await createUserSignUp({
          ...userSignUp,
          ...data,
        })
        const { data: newUserSignUp } = await refetchUserSignUp()

        if (newUserSignUp?.dx_auth) {
          navigate(`${ONBOARDING_URL}${ONBOARDING_PROJECT_URL}`)
        } else if (!userSignUp?.dx_auth) {
          // redirect to Thanks page if user not authorized by the dx team
          // dx_auth must be updated in the bdd
          navigate(`${ONBOARDING_URL}${ONBOARDING_THANKS_URL}`)
        }
      } catch (error) {
        console.error(error)
      }
    }
  })

  return <StepMore control={control} onSubmit={onSubmit} />
}

export default OnboardingMore
