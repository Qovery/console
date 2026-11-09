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
