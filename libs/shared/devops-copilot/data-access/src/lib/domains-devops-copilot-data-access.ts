import { createQueryKeys } from '@lukemorales/query-key-factory'
import axios from 'axios'
import { DEVOPS_COPILOT_API_BASE_URL } from '@qovery/shared/util-node-env'

// Create a dedicated axios instance for DevOps Copilot
export const devopsCopilotAxios = axios.create({
  baseURL: DEVOPS_COPILOT_API_BASE_URL,
})

export const devopsCopilot = createQueryKeys('devopsCopilot', {
  threads: ({ userId, organizationId }: { userId: string; organizationId: string }) => ({
    queryKey: [organizationId, userId],
    async queryFn() {
      const response = await devopsCopilotAxios.get(`/owner/${userId}/organization/${organizationId}/thread`)

      return response.data.threads
    },
  }),

  thread: ({ userId, organizationId, threadId }: { userId: string; organizationId: string; threadId: string }) => ({
    queryKey: [organizationId, userId, threadId],
    async queryFn() {
      const response = await devopsCopilotAxios.get(
        `/owner/${userId}/organization/${organizationId}/thread/${threadId}`
      )

      return response.data
    },
  }),
  config: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn() {
      const response = await devopsCopilotAxios.get(`/organization/${organizationId}/config`)

      return response.data
    },
  }),
  recurringTasks: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId, 'recurring-tasks'],
    async queryFn() {
      const response = await devopsCopilotAxios.get(`/organization/${organizationId}/recurring-tasks`)
      console.log(response)

      return response.data
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
    // Using fetch instead of axios for streaming responses
    // Axios doesn't support streaming in the same way as fetch
    const response = await fetch(
      `${DEVOPS_COPILOT_API_BASE_URL}/owner/${userSub}/organization/${organizationId}/thread/${threadId}/text`,
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
    organizationId,
    message,
    readOnly = true,
  }: {
    userSub: string
    organizationId: string
    message: string
    readOnly?: boolean
  }) => {
    const response = await devopsCopilotAxios.post(`/owner/${userSub}/organization/${organizationId}/thread`, {
      title: message.substring(0, 50),
      read_only: readOnly,
    })

    return response
  },

  addVote: async ({
    userSub,
    messageId,
    vote,
    organizationId,
  }: {
    userSub: string
    messageId: string
    vote: 'upvote' | 'downvote'
    organizationId: string
  }) => {
    const response = await devopsCopilotAxios.post(
      `/owner/${userSub}/organization/${organizationId}/message/${messageId}/vote`,
      {
        user_sub: userSub,
        vote_type: vote,
        current_page_url: window.location.href,
      }
    )

    return response
  },

  toggleRecurringTask: async ({ organizationId, taskId }: { organizationId: string; taskId: string }) => {
    const response = await devopsCopilotAxios.post(`/organization/${organizationId}/recurring-tasks/${taskId}/toggle`)

    return response.data
  },

  deleteRecurringTask: async ({ organizationId, taskId }: { organizationId: string; taskId: string }) => {
    const response = await devopsCopilotAxios.delete(`/organization/${organizationId}/recurring-tasks/${taskId}`)

    return response.data
  },

  updateOrgConfig: async ({
    organizationId,
    enabled,
    readOnly,
    instructions,
  }: {
    organizationId: string
    enabled: boolean
    readOnly: boolean
    instructions?: string
  }) => {
    const response = await devopsCopilotAxios.put(`/organization/${organizationId}/config/org`, {
      enabled,
      read_only: readOnly,
      instructions: instructions || '',
    })

    return response.data
  },
}
