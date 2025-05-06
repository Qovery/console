import { useMutation } from '@tanstack/react-query'

export interface CargoSignupPayload {
  email: string
  first_name: string
  last_name: string
  company: string
  job_title: string
  signup_source: string
}

const CARGO_API_URL = 'https://api.getcargo.io/v1/models/277bc95c-61d5-4fec-beac-9fc211f196a4/records/ingest'
const CARGO_API_TOKEN = '14ea88e74f20be68f0d64e7cb41d52d698f00335d7fd926bfea53fb148df440e'

// https://qovery.slack.com/archives/C08M2RT8T29/p1746543979992499
export function useSignUpCargo() {
  const postToCargo = async (payload: CargoSignupPayload) => {
    try {
      const response = await fetch(`${CARGO_API_URL}?token=${CARGO_API_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Error posting signup data to Cargo: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error posting signup data to Cargo:', error)
      throw error
    }
  }

  return useMutation({
    mutationFn: postToCargo,
    meta: {
      notifyOnError: true,
    },
  })
}

export default useSignUpCargo
