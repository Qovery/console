import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/users-sign-up/data-access'
import { getStoredTrackingParams } from '@qovery/shared/util-hooks'
import { queries } from '@qovery/state/util-queries'
import { type HubspotSignupPayload, useSignUpHubspot } from '../use-signup-hubspot/use-signup-hubspot'

export function useCreateUserSignUp() {
  const queryClient = useQueryClient()
  const { mutate: signUpHubspot } = useSignUpHubspot()

  return useMutation(mutations.createUserSignup, {
    onSuccess(_, variables) {
      queryClient.invalidateQueries({
        queryKey: queries.usersSignUp.get.queryKey,
      })

      const trackingParams = getStoredTrackingParams()

      const signupPayload: HubspotSignupPayload = {
        email: variables.user_email,
        first_name: variables.first_name,
        last_name: variables.last_name,
        company: variables.company_name || '',
        job_title: variables.user_role || '',
        phone: variables.phone ?? '',
        signup_source: 'Console',
        qovery_interest: variables.qovery_usage ?? 'Not specified',
        which_cloud_service_provider_do_you_use_: variables.infrastructure_hosting ?? 'Not specified',
        tracking_params: trackingParams,
      }
      signUpHubspot(signupPayload)
    },
    meta: {
      notifyOnError: true,
    },
  })
}

export default useCreateUserSignUp
