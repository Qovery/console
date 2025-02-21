import { type Cluster, type Environment, type Organization, type Project } from 'qovery-typescript-axios'
import { type AnyService } from '@qovery/domains/services/data-access'
import { type Thread } from './assistant-panel'
import { fetchThread } from './use-thread'

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

export const HACKATHON_API_BASE_URL = 'https://p8080-z73d0931c-z3112284e-gtw.zc531a994.rustrocks.cloud'

export const submitMessage = async (
  message: string,
  token: string,
  threadId?: string,
  context?: Context | null
): Promise<{ id: string; thread: Thread } | null> => {
  try {
    // Ensure we have an organization ID
    const organizationId = context?.organization?.id
    if (!organizationId) {
      throw new Error('Organization ID is required but not provided in context')
    }

    // First, create a new thread
    let _threadId = threadId
    if (!threadId) {
      const createThreadResponse = await fetch(`${HACKATHON_API_BASE_URL}/organization/${organizationId}/thread`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: message.substring(0, 50), // Use first 50 chars as title
        }),
      })

      if (!createThreadResponse.ok) {
        throw new Error(`Failed to create thread: ${createThreadResponse.status}`)
      }

      const threadData = await createThreadResponse.json()
      _threadId = threadData.id
    }

    // Then, send the message to the thread
    const messageResponse = await fetch(
      `${HACKATHON_API_BASE_URL}/organization/${organizationId}/thread/${_threadId}/text`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organization_id: organizationId,
          project_id: context?.project?.id,
          environment_id: context?.environment?.id,
          service_type: context?.service?.service_type,
          service_id: context?.service?.id,
          text: message,
          instructions: 'Please provide a concise response in Markdown format',
        }),
      }
    )

    if (!messageResponse.ok) {
      throw new Error(`Failed to send message: ${messageResponse.status}`)
    }

    if (!_threadId) {
      throw new Error('Failed to fetch thread')
    }

    const messages = await fetchThread(organizationId, _threadId, token)

    // Convertir les messages du format API vers le format Thread
    const formattedMessages: Thread = messages.map((msg: any) => ({
      id: msg.id,
      text: msg.media_content,
      owner: msg.owner,
      timestamp: new Date(msg.created_at).getTime(),
    }))

    // Return the message content (assuming it's markdown or text)
    return {
      id: _threadId,
      thread: formattedMessages,
    }
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}

export default submitMessage
