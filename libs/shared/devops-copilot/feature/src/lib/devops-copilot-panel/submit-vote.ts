import { type Cluster, type Environment, type Organization, type Project } from 'qovery-typescript-axios'
import { type AnyService } from '@qovery/domains/services/data-access'
import { HACKATHON_API_BASE_URL } from './submit-message'

type Context = {
  organization?: Organization
  cluster?: Cluster
  project?: Project
  environment?: Environment
  service?: AnyService
  deployment?:
    | {
        execution_id?: string
      }
    | undefined
}

export async function submitVote(
  userSub: string,
  messageId: number,
  vote: 'upvote' | 'downvote',
  token: string,
  context?: Context | null
): Promise<{ id: string }> {
  try {
    const organizationId = context?.organization?.id
    if (!organizationId) {
      throw new Error('Organization ID is required but not provided in context')
    }

    if (!messageId) {
      throw new Error('Message ID is required but not provided')
    }

    const response = await fetch(
      `${HACKATHON_API_BASE_URL}/owner/${userSub}/organization/${organizationId}/message/${messageId}/vote`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_sub: userSub, vote_type: vote, current_page_url: window.location.href }),
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to submit vote: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error submitting vote:', error)
    throw error
  }
}
