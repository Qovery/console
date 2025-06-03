import { HACKATHON_API_BASE_URL } from '../../devops-copilot-panel/submit-message'

export const fetchAllThreads = async (owner: string, organizationId: string, token: string): Promise<Response> => {
  const response = await fetch(`${HACKATHON_API_BASE_URL}/owner/${owner}/organization/${organizationId}/thread`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Error fetching threads: ${response.status}`)
  }

  return response
}
