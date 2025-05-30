import { type Cluster, type Environment, type Organization, type Project } from 'qovery-typescript-axios'
import { type AnyService } from '@qovery/domains/services/data-access'
import { type Thread } from './devops-copilot-panel'
import { fetchThread } from '../hooks/fetch-thread/fetch-thread'
import { addThread } from '../hooks/add-thread/add-thread'
import { addMessageToThread } from '../hooks/add-message-to-thread/add-message-to-thread'

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

      const response = await addThread(userSub, token, organizationId, message)
      const responseJson = await response.json()
      _threadId = responseJson.id
    }

    if (!_threadId) {
      throw new Error('Failed to fetch thread')
    }

    // Then, send the message to the thread
    const messageResponse = await addMessageToThread(userSub, token, organizationId, _threadId, message, context, signal)
    

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
    const messagesReturn = await fetchThread(userSub, organizationId, _threadId, token)
    const messageJson = await messagesReturn.json()
    const messages = messageJson.results || []

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
