import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/users-sign-up/data-access'
import { queries } from '@qovery/state/util-queries'
import { type CargoSignupPayload, useSignUpCargo } from '../use-signup-cargo/use-signup-cargo'

function getUtmParams() {
  return {
    utm_source: localStorage.getItem('utm_source'),
    utm_medium: localStorage.getItem('utm_medium'),
    utm_campaign: localStorage.getItem('utm_campaign'),
    utm_term: localStorage.getItem('utm_term'),
    utm_content: localStorage.getItem('utm_content'),
  }
}

export function useCreateUserSignUp() {
  const queryClient = useQueryClient()
  const { mutate: signUpCargo } = useSignUpCargo()

  return useMutation(mutations.createUserSignup, {
    onSuccess(_, variables) {
      queryClient.invalidateQueries({
        queryKey: queries.usersSignUp.get.queryKey,
      })

      const utmParams = getUtmParams()

      const cargoPayload: CargoSignupPayload = {
        email: variables.user_email,
        first_name: variables.first_name,
        last_name: variables.last_name,
        company: variables.company_name || '',
        job_title: variables.user_role || '',
        phone: variables.phone ?? '',
        signup_source: 'Console',
        ...utmParams,
      }
      signUpCargo(cargoPayload)
    },
    meta: {
      notifyOnError: true,
    },
  })
}

export default useCreateUserSignUp
