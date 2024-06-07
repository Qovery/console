import { useQuery } from '@tanstack/react-query'
import {
  OrganizationEventApi,
  type OrganizationEventResponseList,
  type OrganizationEventTargetResponseList,
} from 'qovery-typescript-axios'
import {
  type OrganizationEventOrigin,
  type OrganizationEventSubTargetType,
  type OrganizationEventTargetType,
  type OrganizationEventType,
} from 'qovery-typescript-axios/api'
import { toastError } from '@qovery/shared/ui'

const eventsApi = new OrganizationEventApi()

export interface EventQueryParams {
  pageSize?: number | null
  fromTimestamp?: string | null
  toTimestamp?: string | null
  eventType?: OrganizationEventType | null
  targetType?: OrganizationEventTargetType | null
  targetId?: string | null
  subTargetType?: OrganizationEventSubTargetType | null
  triggeredBy?: string | null
  origin?: OrganizationEventOrigin | null
  continueToken?: string | null
  stepBackToken?: string | null
  projectId?: string | null
  environmentId?: string | null
}

export const useFetchEvents = (organizationId: string, queryParams: EventQueryParams) => {
  queryParams.continueToken ??= undefined
  queryParams.stepBackToken ??= undefined
  queryParams.eventType ??= undefined
  queryParams.targetType ??= undefined
  queryParams.subTargetType ??= undefined
  queryParams.triggeredBy ??= undefined
  queryParams.origin ??= undefined
  const {
    pageSize,
    eventType,
    subTargetType,
    targetId,
    targetType,
    origin,
    triggeredBy,
    toTimestamp,
    fromTimestamp,
    continueToken,
    stepBackToken,
  } = queryParams
  return useQuery<OrganizationEventResponseList, Error>(
    ['organization', organizationId, 'events', queryParams],
    async () => {
      const response = await eventsApi.getOrganizationEvents(
        organizationId,
        pageSize,
        fromTimestamp,
        toTimestamp,
        continueToken,
        stepBackToken,
        eventType,
        targetType,
        targetId,
        subTargetType,
        triggeredBy,
        origin
      )
      return response.data
    },
    {
      onError: (err) => toastError(err),
    }
  )
}

export const useFetchEventTargets = (organizationId: string, queryParams: EventQueryParams, enabled?: boolean) => {
  queryParams.eventType ??= undefined
  queryParams.targetType ??= undefined
  queryParams.triggeredBy ??= undefined
  queryParams.origin ??= undefined
  queryParams.projectId ??= undefined
  queryParams.environmentId ??= undefined
  const { eventType, targetType, origin, triggeredBy, toTimestamp, fromTimestamp, projectId, environmentId } =
    queryParams

  return useQuery<OrganizationEventTargetResponseList, Error>(
    ['organization', organizationId, 'events-targets', queryParams],
    async () => {
      const response = await eventsApi.getOrganizationEventTargets(
        organizationId,
        fromTimestamp,
        toTimestamp,
        eventType,
        targetType,
        triggeredBy,
        origin,
        projectId,
        environmentId
      )
      return response.data
    },
    {
      onError: (err) => toastError(err),
      enabled: enabled,
    }
  )
}
