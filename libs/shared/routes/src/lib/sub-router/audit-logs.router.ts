import { type OrganizationEventTargetType } from 'qovery-typescript-axios'

export const AUDIT_LOGS_URL = (organizationId = ':organizationId') => `/organization/${organizationId}/audit-logs`
export const AUDIT_LOGS_GENERAL_URL = '/general'
export const AUDIT_LOGS_PARAMS_URL = (
  organizationId = ':organizationId',
  params: {
    targetType?: OrganizationEventTargetType
    projectId?: string
    environmentId?: string
    targetId?: string
  }
) => {
  const path = `${AUDIT_LOGS_URL(organizationId)}${AUDIT_LOGS_GENERAL_URL}`
  const url = new URLSearchParams(params).toString()
  return `${path}?${url}`
}
