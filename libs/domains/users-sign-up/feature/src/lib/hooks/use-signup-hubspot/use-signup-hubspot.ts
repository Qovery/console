import { useMutation } from '@tanstack/react-query'

const HUBSPOT_PORTAL_ID = '25346960'
const HUBSPOT_FORM_ID = '159ac368-09f9-4596-8d1e-9634bc0a4a8b'
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
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_term?: string | null
  utm_content?: string | null
  gclid?: string | null
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
  if (payload.utm_source != null && payload.utm_source !== '')
    fields.push({ name: 'utm_source', value: payload.utm_source })
  if (payload.utm_medium != null && payload.utm_medium !== '')
    fields.push({ name: 'utm_medium', value: payload.utm_medium })
  if (payload.utm_campaign != null && payload.utm_campaign !== '')
    fields.push({ name: 'utm_campaign', value: payload.utm_campaign })
  if (payload.utm_term != null && payload.utm_term !== '') fields.push({ name: 'utm_term', value: payload.utm_term })
  if (payload.utm_content != null && payload.utm_content !== '')
    fields.push({ name: 'utm_content', value: payload.utm_content })
  if (payload.gclid != null && payload.gclid !== '') fields.push({ name: 'gclid', value: payload.gclid })
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
