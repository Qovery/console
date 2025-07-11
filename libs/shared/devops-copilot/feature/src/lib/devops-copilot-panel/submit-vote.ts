import { type Cluster, type Environment, type Organization, type Project } from 'qovery-typescript-axios'
import { type AnyService } from '@qovery/domains/services/data-access'
import { mutations } from '@qovery/shared/devops-copilot/data-access'

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
  messageId: string,
  vote: 'upvote' | 'downvote',
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

    const response = await mutations.addVote({ userSub, messageId, vote, organizationId })
    return response.data
  } catch (error) {
    console.error('Error submitting vote:', error)
    throw error
  }
}
