import { useQuery } from '@tanstack/react-query'
import {
  EnvironmentsApi,
  OrganizationEventApi,
  OrganizationMainCallsApi,
  ProjectsApi,
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
const organizationApi = new OrganizationMainCallsApi()
const projectsApi = new ProjectsApi()
const environmentsApi = new EnvironmentsApi()

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
  queryParams.projectId ??= undefined
  queryParams.environmentId ??= undefined
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
    projectId,
    environmentId,
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

export interface ValidTargetIds {
  services: Set<string>
  projects: Set<string>
  environments: Set<string>
}

export const useFetchValidTargetIds = (organizationId: string) => {
  return useQuery<ValidTargetIds, Error>(
    ['organization', organizationId, 'valid-target-ids'],
    async () => {
      // Fetch all services
      const servicesResponse = await organizationApi.listServicesByOrganizationId(organizationId)
      const services = servicesResponse.data.results || []

      // Fetch all projects
      const projectsResponse = await projectsApi.listProject(organizationId)
      const projects = projectsResponse.data.results || []

      // Fetch all environments for each project
      // TODO (qov-1236) Fetching environments should pass through the new org environments endpoint
      const environmentsPromises = projects.map((project) =>
        project.id ? environmentsApi.listEnvironment(project.id) : Promise.resolve({ data: { results: [] } })
      )
      const environmentsResponses = await Promise.all(environmentsPromises)
      const allEnvironments = environmentsResponses.flatMap((response) => response.data.results || [])

      const validTargetIds: ValidTargetIds = {
        services: new Set(services.map((service) => service.id).filter((id): id is string => !!id)),
        projects: new Set(projects.map((project) => project.id).filter((id): id is string => !!id)),
        environments: new Set(allEnvironments.map((env) => env.id).filter((id): id is string => !!id)),
      }

      return validTargetIds
    },
    {
      refetchInterval: 60000, // Refetch every 60 seconds
      staleTime: 60000, // Consider data stale after 60 seconds
      onError: (err) => toastError(err),
    }
  )
}
