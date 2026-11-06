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

export const ENV_TYPES = ['PRODUCTION', 'STAGING', 'DEVELOPMENT', 'PREVIEW'] as const

export const ALERT_VARIABLES = [
  'organization_name',
  'project_name',
  'environment_name',
  'environment_type',
  'failed_services',
  'failed_step',
  'triggered_by',
  'error_message',
  'console_url',
  'logs_url',
  'alert_settings_url',
]
