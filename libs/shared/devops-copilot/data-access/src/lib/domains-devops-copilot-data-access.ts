import { createQueryKeys } from '@lukemorales/query-key-factory'
import axios from 'axios'
import { DEVOPS_COPILOT_API_BASE_URL } from '@qovery/shared/util-node-env'

export interface RecurringTask {
  id: string
  user_id: string
  user_intent: string
  cron_expression: string
  enabled: boolean
  environment: string
  created_at: string
  updated_at: string
  last_run_at?: string
  next_run_at?: string
  error_count: number
  last_error?: string
}

export interface RecurringTasksResponse {
  tasks: RecurringTask[]
}

export interface AICopilotOrgConfig {
  enabled: boolean
  read_only: boolean
  instructions?: string
}

export interface AICopilotRoleConfig {
  id: string
  organization_id: string
  role_id: string
  role_name: string
  enabled: boolean
  read_only: boolean
  instructions?: string
  created_at: string
  updated_at: string
}

export interface AICopilotUserAccess {
  enabled: boolean
  read_only: boolean
  instructions?: string
}

export interface AICopilotConfigResponse {
  org_config: AICopilotOrgConfig
  role_configs: AICopilotRoleConfig[]
  user_access?: AICopilotUserAccess
}

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
    async queryFn(): Promise<AICopilotConfigResponse> {
      const response = await devopsCopilotAxios.get<AICopilotConfigResponse>(`/organization/${organizationId}/config`)

      return response.data
    },
  }),
  recurringTasks: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn(): Promise<RecurringTasksResponse> {
      const response = await devopsCopilotAxios.get<RecurringTasksResponse>(
        `/organization/${organizationId}/recurring-tasks`
      )

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
      environment?: { id: string; cluster_id?: string }
      service?: { service_type?: string; id?: string }
    }
    signal?: AbortSignal
  }) => {
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
          cluster_id: context?.environment?.cluster_id,
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
    userEmail,
  }: {
    organizationId: string
    enabled: boolean
    readOnly: boolean
    instructions?: string
    userEmail?: string
  }) => {
    const response = await devopsCopilotAxios.put(`/organization/${organizationId}/config/org`, {
      enabled,
      read_only: readOnly,
      instructions: instructions || '',
      user_email: userEmail,
    })

    return response.data
  },
}
