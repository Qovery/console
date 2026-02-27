import { useMutation } from '@tanstack/react-query'

const HUBSPOT_PORTAL_ID = '25346960'
const HUBSPOT_FORM_ID = '70df367c-130e-4bf8-866a-c972f565c67a'
const HUBSPOT_SUBMIT_URL = `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`

export interface HubspotSignupPayload {
  email: string
  first_name: string
  last_name: string
  company: string
  job_title: string
  signup_source: string
  phone: string
  /** Maps to HubSpot required field qovery_interest (e.g. from qovery_usage) */
  qovery_interest: string
  /** Maps to HubSpot required field which_cloud_service_provider_do_you_use_ */
  which_cloud_service_provider_do_you_use_: string
  /** All URL/tracking params captured at landing (utm_*, gclid, etc.) — sent as HubSpot fields */
  tracking_params?: Record<string, string>
}

function toHubspotFields(payload: HubspotSignupPayload): { name: string; value: string }[] {
  const fields: { name: string; value: string }[] = [
    { name: 'email', value: payload.email },
    { name: 'firstname', value: payload.first_name },
    { name: 'lastname', value: payload.last_name },
    { name: 'company', value: payload.company },
    { name: 'jobtitle', value: payload.job_title },
    { name: 'phone', value: payload.phone || '—' },
    { name: 'signup_source', value: payload.signup_source },
    { name: 'qovery_interest', value: payload.qovery_interest || 'Not specified' },
    {
      name: 'which_cloud_service_provider_do_you_use_',
      value: payload.which_cloud_service_provider_do_you_use_ || 'Not specified',
    },
  ]
  const tracking = payload.tracking_params ?? {}
  for (const [name, value] of Object.entries(tracking)) {
    if (name && value != null && value !== '') {
      fields.push({ name, value })
    }
  }
  return fields
}

export function useSignUpHubspot() {
  const postToHubspot = async (payload: HubspotSignupPayload) => {
    const response = await fetch(HUBSPOT_SUBMIT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: toHubspotFields(payload),
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Error posting signup data to HubSpot: ${response.status} ${response.statusText} - ${text}`)
    }

    return response.json()
  }

  return useMutation({
    mutationFn: postToHubspot,
    meta: {
      notifyOnError: true,
    },
  })
}

export default useSignUpHubspot
