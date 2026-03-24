import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

type QoveryRouteParams = {
  organizationId: string
  clusterId: string
  projectId: string
  environmentId?: string
  databaseId?: string
  applicationId?: string
  serviceId?: string
  versionId?: string
}

function getSegmentValue(segments: string[], segmentName: string) {
  const index = segments.indexOf(segmentName)
  return index >= 0 ? segments[index + 1] : undefined
}

function normalizeRouteParam(value?: string) {
  if (!value) {
    return undefined
  }

  const normalizedValue = decodeURIComponent(value).replace(/\s+/g, '').trim()
  return normalizedValue.length > 0 ? normalizedValue : undefined
}

function getRouteParams(pathname: string): QoveryRouteParams {
  const segments = pathname.split('/').filter(Boolean)
  const environmentLogsIndex = segments.indexOf('logs')

  const serviceIdFromLogs =
    environmentLogsIndex >= 0 && segments[environmentLogsIndex + 2] === 'service-logs'
      ? segments[environmentLogsIndex + 1]
      : undefined

  const serviceIdFromDeploymentLogs =
    environmentLogsIndex >= 0 && segments[environmentLogsIndex + 2] === 'deployment-logs'
      ? segments[environmentLogsIndex + 1]
      : undefined

  const versionIdFromLegacyLogs =
    environmentLogsIndex >= 0 && segments[environmentLogsIndex + 2] === 'deployment-logs'
      ? segments[environmentLogsIndex + 3]
      : undefined

  const versionIdFromNewNavigation =
    segments.includes('deployments') && segments.includes('logs') ? getSegmentValue(segments, 'logs') : undefined

  return {
    organizationId: normalizeRouteParam(getSegmentValue(segments, 'organization')) ?? '',
    clusterId: normalizeRouteParam(getSegmentValue(segments, 'cluster')) ?? '',
    projectId: normalizeRouteParam(getSegmentValue(segments, 'project')) ?? '',
    environmentId: normalizeRouteParam(getSegmentValue(segments, 'environment')),
    databaseId: normalizeRouteParam(getSegmentValue(segments, 'database')),
    applicationId: normalizeRouteParam(getSegmentValue(segments, 'application')),
    serviceId:
      normalizeRouteParam(getSegmentValue(segments, 'service')) ??
      normalizeRouteParam(serviceIdFromLogs) ??
      normalizeRouteParam(serviceIdFromDeploymentLogs),
    versionId: normalizeRouteParam(versionIdFromNewNavigation) ?? normalizeRouteParam(versionIdFromLegacyLogs),
  }
}

export function useQoveryContext() {
  const pathname = typeof window === 'undefined' ? '/' : window.location.pathname
  const { organizationId, clusterId, projectId, environmentId, databaseId, applicationId, serviceId, versionId } =
    getRouteParams(pathname)

  const contextualServiceId = applicationId || serviceId || databaseId

  const { data: organization } = useQuery({
    ...queries.organizations.details({ organizationId }),
    enabled: Boolean(organizationId),
  })

  const { data: project } = useQuery({
    ...queries.projects.list({ organizationId }),
    enabled: Boolean(organizationId) && Boolean(projectId),
    select: (projects) => projects?.find((candidate) => candidate.id === projectId),
  })

  const { data: environment } = useQuery({
    ...queries.environments.details({ environmentId: environmentId ?? '' }),
    enabled: Boolean(environmentId),
  })

  const resolvedClusterId = clusterId || environment?.cluster_id
  const { data: cluster } = useQuery({
    ...queries.clusters.list({ organizationId }),
    enabled: Boolean(organizationId) && Boolean(resolvedClusterId),
    select: (clusters) => clusters?.find((candidate) => candidate.id === resolvedClusterId),
  })

  const { data: service } = useQuery({
    ...queries.services.list(environmentId ?? ''),
    enabled: Boolean(environmentId) && Boolean(contextualServiceId),
    select: (services) => services?.find((candidate) => candidate.id === contextualServiceId),
  })

  const entityMap = [
    [service, 'service'],
    [environment, 'environment'],
    [project, 'project'],
    [cluster, 'cluster'],
    [organization, 'organization'],
  ] as const

  const current = entityMap.find(([entity]) => entity !== undefined)

  return {
    context: {
      organization,
      cluster,
      project,
      environment,
      service,
      deployment: service && {
        execution_id: versionId,
      },
    },
    current: current && typeof current[0] === 'object' ? { ...current[0], type: current[1] } : undefined,
  }
}

export default useQoveryContext
