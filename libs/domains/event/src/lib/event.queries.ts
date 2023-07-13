import {
  OrganizationEventApi,
  OrganizationEventResponseList,
  OrganizationEventTargetResponseList,
} from 'qovery-typescript-axios'
import {
  OrganizationEventOrigin,
  OrganizationEventSubTargetType,
  OrganizationEventTargetType,
  OrganizationEventType,
} from 'qovery-typescript-axios/api'
import { useQuery } from 'react-query'
import { toastError } from '@qovery/shared/ui'

const eventsApi = new OrganizationEventApi()

export interface EventQueryParams {
  pageSize?: number
  fromTimestamp?: string
  toTimestamp?: string
  eventType?: OrganizationEventType
  targetType?: OrganizationEventTargetType
  targetId?: string
  subTargetType?: OrganizationEventSubTargetType
  triggeredBy?: string
  origin?: OrganizationEventOrigin
  continueToken?: string
  stepBackToken?: string
}

export interface EventTargetsQueryParams {
  fromTimestamp?: string
  toTimestamp?: string
  eventType?: OrganizationEventType
  targetType?: OrganizationEventTargetType
  triggeredBy?: string
  origin?: OrganizationEventOrigin
  projectId?: string
  environmentId?: string
}

export const useFetchEvents = (organizationId: string, queryParams: EventQueryParams) => {
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

export const useFetchEventTargets = (organizationId: string, queryParams: EventTargetsQueryParams) => {
  const { eventType, targetType, origin, triggeredBy, toTimestamp, fromTimestamp, projectId, environmentId } =
    queryParams
  return useQuery<OrganizationEventTargetResponseList, Error>(
    ['organization', organizationId, 'events', queryParams],
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
    }
  )
}
