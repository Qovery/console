import { HACKATHON_API_BASE_URL } from '../../devops-copilot-panel/submit-message'

export const addMessageToThread = async (
  userSub: string,
  token: string,
  organizationId: string,
  threadId: string,
  message: string,
  context?: {
    project?: { id: string }
    environment?: { id: string }
    service?: { service_type?: string; id?: string }
  },
  signal?: AbortSignal
): Promise<Response> => {
  const response = await fetch(
    `${HACKATHON_API_BASE_URL}/owner/${userSub}/organization/${organizationId}/thread/${threadId}/text`,
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

  if (!response.ok) {
    throw new Error(`Failed to send message: ${response.status}`)
  }

  return response
}
