import { mutations } from '@qovery/shared/devops-copilot/data-access'
import type { CopilotContextData } from './devops-copilot-panel'

export async function submitVote(
  userSub: string,
  messageId: string,
  vote: 'upvote' | 'downvote',
  context?: CopilotContextData | null
): Promise<{ id: string }> {
  try {
    const organizationId = context?.organization?.id
    if (!organizationId) {
      throw new Error('Organization ID is required but not provided in context')
    }

    if (!messageId) {
      throw new Error('Message ID is required but not provided')
    }

    const response = await mutations.addVote({ userSub, messageId, vote, organizationId })
    return response.data
  } catch (error) {
    console.error('Error submitting vote:', error)
    throw error
  }
}
