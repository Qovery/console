import { HACKATHON_API_BASE_URL } from '../../devops-copilot-panel/submit-message'

export async function addVote(
  userSub: string,
  messageId: number,
  vote: 'upvote' | 'downvote',
  token: string,
  organizationId: string
): Promise<Response> {
  const response = await fetch(
    `${HACKATHON_API_BASE_URL}/owner/${userSub}/organization/${organizationId}/message/${messageId}/vote`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_sub: userSub,
        vote_type: vote,
        current_page_url: window.location.href,
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to submit vote: ${response.statusText}`)
  }

  return response
}
