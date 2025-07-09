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

export const submitMessage = async (
  userSub: string,
  message: string,
  token: string,
  threadId?: string,
  context?: Context | null,
  onStream?: (chunk: string) => void,
  signal?: AbortSignal
): Promise<{ id: string; messageId: string } | null> => {
  try {
    // Ensure we have an organization ID
    const organizationId = context?.organization?.id
    if (!organizationId) {
      throw new Error('Organization ID is required but not provided in context')
    }

    // First, create a new thread
    let _threadId = threadId
    if (!threadId) {
      const response = await mutations.addThread({ userSub, organizationId, message })
      const responseJson = response.data
      _threadId = responseJson.id
    }

    if (!_threadId) {
      throw new Error('Failed to fetch thread')
    }

    // Then, send the message to the thread
    const messageResponse = await mutations.addMessage({
      userSub,
      token,
      organizationId,
      threadId: _threadId,
      message,
      context,
      signal,
    })

    let assistantMessageId = ''

    if (onStream && messageResponse.body) {
      const reader = messageResponse.body.getReader()
      const decoder = new TextDecoder()

      let result = await reader.read()
      while (!result.done) {
        const chunk = decoder.decode(result.value, { stream: true })
        const lines = chunk.split('\n').filter((line) => line.startsWith('data:'))

        for (const line of lines) {
          const cleanChunk = line.slice(5).trim()
          onStream(cleanChunk)

          try {
            const parsed = JSON.parse(cleanChunk)
            if (parsed.type === 'complete' && parsed.content?.id) {
              assistantMessageId = parsed.content.id
            }
          } catch (e) {
            console.error('Failed to parse chunk:', cleanChunk, e)
          }
        }

        result = await reader.read()
      }
    }

    return {
      id: _threadId,
      messageId: assistantMessageId || '',
    }
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}
