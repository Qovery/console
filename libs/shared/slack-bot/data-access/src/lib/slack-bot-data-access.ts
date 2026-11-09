import { createQueryKeys } from '@lukemorales/query-key-factory'
import axios from 'axios'
import { SLACK_BOT_API_URL } from '@qovery/shared/util-node-env'

export interface SlackInstallation {
  id: string
  slack_team_id: string
  slack_team_name: string
  active: boolean
  error_state: string | null
  created_at: string
}

export interface AlertRule {
  id: string
  installation_id: string
  organization_id: string
  name: string
  project_ids: string[]
  environment_ids: string[]
  slack_channel_id: string
  alert_deployment_failed: boolean
  alert_failure_loop: boolean
  alert_recovered: boolean
  environment_types: string[]
  message_template?: { block_type: string; enabled: boolean; custom_text?: string }[] | null
  created_at: string
}

export interface SlackChannel {
  id: string
  name: string
  is_private: boolean
}

export const slackBotAxios = axios.create({
  baseURL: SLACK_BOT_API_URL,
})

export const slackBot = createQueryKeys('slackBot', {
  installations: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn(): Promise<SlackInstallation[]> {
      const response = await slackBotAxios.get<SlackInstallation[]>(`/api/v1/org/${organizationId}/installations`)
      return response.data
    },
  }),
  alertRules: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn(): Promise<AlertRule[]> {
      const response = await slackBotAxios.get<AlertRule[]>(`/api/v1/org/${organizationId}/alert-rules`)
      return response.data
    },
  }),
  channels: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn(): Promise<SlackChannel[]> {
      const response = await slackBotAxios.get<SlackChannel[]>(`/api/v1/org/${organizationId}/channels`)
      return response.data
    },
  }),
})

export const slackBotMutations = {
  createAlertRule: async ({
    organizationId,
    installationId,
    payload,
  }: {
    organizationId: string
    installationId: string
    payload: Omit<AlertRulePayload, 'installation_id'>
  }) => {
    const response = await slackBotAxios.post(`/api/v1/org/${organizationId}/alert-rules`, {
      installation_id: installationId,
      ...payload,
    })
    return response.data
  },

  updateAlertRule: async ({
    organizationId,
    ruleId,
    payload,
  }: {
    organizationId: string
    ruleId: string
    payload: AlertRulePayload
  }) => {
    const response = await slackBotAxios.put(`/api/v1/org/${organizationId}/alert-rules/${ruleId}`, payload)
    return response.data
  },

  deleteAlertRule: async ({ organizationId, ruleId }: { organizationId: string; ruleId: string }) => {
    const response = await slackBotAxios.delete(`/api/v1/org/${organizationId}/alert-rules/${ruleId}`)
    return response.data
  },

  deleteInstallation: async ({ organizationId }: { organizationId: string }) => {
    const response = await slackBotAxios.delete(`/api/v1/org/${organizationId}/installations`)
    return response.data
  },
}

export interface AlertRulePayload {
  name: string
  slack_channel_id: string
  project_ids: string[]
  environment_ids: string[]
  alert_deployment_failed: boolean
  alert_failure_loop: boolean
  alert_recovered: boolean
  environment_types: string[]
  message_template?: { block_type: string; enabled: boolean; custom_text?: string }[] | null
}
