import { type Cluster, type Environment, type Organization, type Project } from 'qovery-typescript-axios'
import { type AnyService } from '@qovery/domains/services/data-access'
import { type Thread } from './devops-copilot-panel'
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

export const HACKATHON_API_BASE_URL = 'https://p8080-z7df85604-zb0f30ecb-gtw.qovery.com'

export const submitMessage = async (
  userSub: string,
  message: string,
  token: string,
  threadId?: string,
  context?: Context | null,
  onStream?: (chunk: string) => void,
  signal?: AbortSignal
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
      const createThreadResponse = await fetch(
        `${HACKATHON_API_BASE_URL}/owner/${userSub}/organization/${organizationId}/thread`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: message.substring(0, 50), // Use first 50 chars as title
          }),
        }
      )

      if (!createThreadResponse.ok) {
        throw new Error(`Failed to create thread: ${createThreadResponse.status}`)
      }

      const threadData = await createThreadResponse.json()
      _threadId = threadData.id
    }

    // Then, send the message to the thread
    const messageResponse = await fetch(
      `${HACKATHON_API_BASE_URL}/owner/${userSub}/organization/${organizationId}/thread/${_threadId}/text`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({
          organization_id: organizationId,
          project_id: context?.project?.id,
          environment_id: context?.environment?.id,
          service_type: context?.service?.service_type,
          service_id: context?.service?.id,
          text: message,
          instructions: 'Please provide a concise response in Markdown format',
          stream: true,
        }),
        signal,
      }
    )

    if (!messageResponse.ok) {
      throw new Error(`Failed to send message: ${messageResponse.status}`)
    }

    if (!_threadId) {
      throw new Error('Failed to fetch thread')
    }

    // Process streaming response if onStream callback is provided
    if (onStream && messageResponse.body) {
      const reader = messageResponse.body.getReader()
      const decoder = new TextDecoder()

      // Process the stream until it's done
      const processStream = async () => {
        let result = await reader.read()

        while (!result.done) {
          const chunk = decoder.decode(result.value, { stream: true })

          // Parse SSE data
          const chunks = chunk
            .split('\n\n')
            .map((block) =>
              block
                .split('\n')
                .filter((line) => line.startsWith('data:'))
                .map((line) => line.slice(5).trim())
                .join('')
            )
            .filter(Boolean)

          // Send each chunk to the callback
          for (const cleanChunk of chunks) {
            onStream(cleanChunk)
          }

          // Read the next chunk
          result = await reader.read()
        }
      }

      await processStream()
    }

    // Fetch and format the thread messages
    const messages = await fetchThread(userSub, organizationId, _threadId, token)

    const formattedMessages: Thread = messages.map(
      (msg: { id: string; media_content: string; owner: string; created_at: string }) => ({
        id: msg.id,
        text: msg.media_content,
        owner: msg.owner,
        timestamp: new Date(msg.created_at).getTime(),
      })
    )

    return {
      id: _threadId,
      thread: formattedMessages,
    }
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}
