import { createQueryKeys } from '@lukemorales/query-key-factory'

export const HACKATHON_API_BASE_URL = 'https://p8080-z7df85604-zb0f30ecb-gtw.qovery.com'

export const devopsCopilot = createQueryKeys('devopsCopilot', {
  thread: ({
    userId,
    organizationId,
    threadId,
    token,
  }: {
    userId: string
    organizationId: string
    threadId: string
    token: string
  }) => ({
    queryKey: [organizationId, userId, threadId],
    async queryFn() {
      const response = await fetch(
        `${HACKATHON_API_BASE_URL}/owner/${userId}/organization/${organizationId}/thread/${threadId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch thread')
      }

      return response.json()
    },
  }),
})

export const mutations = {
  addMessage: async ({
    userSub,
    organizationId,
    threadId,
    message,
    token,
    context,
    signal,
  }: {
    userSub: string
    organizationId: string
    threadId: string
    message: string
    token: string
    context?: {
      project?: { id: string }
      environment?: { id: string }
      service?: { service_type?: string; id?: string }
    }
    signal?: AbortSignal
  }) => {
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
  },

  addThread: async ({
    userSub,
    token,
    organizationId,
    message,
  }: {
    userSub: string
    token: string
    organizationId: string
    message: string
  }) => {
    const response = await fetch(`${HACKATHON_API_BASE_URL}/owner/${userSub}/organization/${organizationId}/thread`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: message.substring(0, 50),
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create thread: ${response.status}`)
    }

    return response
  },
}
