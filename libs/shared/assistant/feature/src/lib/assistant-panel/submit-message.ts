import { type Cluster, type Environment, type Organization, type Project } from 'qovery-typescript-axios'
import { type AnyService } from '@qovery/domains/services/data-access'

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

const API_BASE_URL = 'https://p8080-z73d0931c-z3112284e-gtw.zc531a994.rustrocks.cloud'

export const submitMessage = async (message: string, token: string, context?: Context | null): Promise<string> => {
  try {
    // Ensure we have an organization ID
    const organizationId = context?.organization?.id
    if (!organizationId) {
      throw new Error('Organization ID is required but not provided in context')
    }

    // First, create a new thread
    const createThreadResponse = await fetch(`${API_BASE_URL}/organization/${organizationId}/thread`, {
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
    const threadId = threadData.id

    // Then, send the message to the thread
    const messageResponse = await fetch(`${API_BASE_URL}/organization/${organizationId}/thread/${threadId}/text`, {
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
    })

    if (!messageResponse.ok) {
      throw new Error(`Failed to send message: ${messageResponse.status}`)
    }

    // Finally, retrieve the complete thread to get the response
    const threadResponse = await fetch(`${API_BASE_URL}/organization/${organizationId}/thread`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!threadResponse.ok) {
      throw new Error(`Failed to retrieve thread: ${threadResponse.status}`)
    }

    const threadContent = await threadResponse.json()
    const latestMessage = threadContent.results[threadContent.results.length - 1]

    // Return the message content (assuming it's markdown or text)
    return latestMessage.media_content
  } catch (error) {
    console.error('Error:', error)
    return `
# An error occurred

I apologize, but I encountered an error while processing your request. Please try again later or contact support if the issue persists.
`
  }
}

export default submitMessage
