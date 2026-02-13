import { type OrganizationEventResponse, OrganizationEventTargetType } from 'qovery-typescript-axios'
import { type ValidTargetIds } from '@qovery/domains/audit-logs/data-access'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

export const isEventTypeFailed = (event: OrganizationEventResponse) => event.event_type?.toLowerCase().includes('fail')

export const formatEventName = (eventType: OrganizationEventResponse['event_type']) => {
  return eventType?.split('_').map(upperCaseFirstLetter).join(' ')
}

export const checkTargetExists = (event: OrganizationEventResponse, validTargetIds?: ValidTargetIds): boolean => {
  const { target_id, target_type } = event

  if (!validTargetIds || !target_id) return true // If no validation data, assume exists

  switch (target_type) {
    case OrganizationEventTargetType.APPLICATION:
    case OrganizationEventTargetType.CONTAINER:
    case OrganizationEventTargetType.JOB:
    case OrganizationEventTargetType.HELM:
    case OrganizationEventTargetType.TERRAFORM:
    case OrganizationEventTargetType.DATABASE:
      return validTargetIds.services.has(target_id)
    case OrganizationEventTargetType.PROJECT:
      return validTargetIds.projects.has(target_id)
    case OrganizationEventTargetType.ENVIRONMENT:
      return validTargetIds.environments.has(target_id)
    default:
      return true // For other types, assume they exist
  }
}
