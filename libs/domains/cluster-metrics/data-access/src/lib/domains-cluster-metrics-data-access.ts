import { createQueryKeys } from '@lukemorales/query-key-factory'
import { ClustersApi, OrganizationEventApi, OrganizationEventTargetType } from 'qovery-typescript-axios'

const clusterApi = new ClustersApi()
const auditLogsApi = new OrganizationEventApi()

export const clusterMetrics = createQueryKeys('clusterMetrics', {
  events: ({
    clusterId,
    fromDateTime,
    toDateTime,
    reportingComponent,
    nodeName,
  }: {
    clusterId: string
    fromDateTime: string
    toDateTime: string
    reportingComponent?: string
    nodeName?: string
  }) => ({
    queryKey: [clusterId, fromDateTime, toDateTime, reportingComponent, nodeName],
    async queryFn() {
      const response = await clusterApi.getClusterKubernetesEvents(
        clusterId,
        fromDateTime,
        toDateTime,
        nodeName,
        undefined,
        reportingComponent
      )
      return response.data.results
    },
  }),
  auditLogs: ({
    organizationId,
    clusterId,
    toTimestamp,
  }: {
    organizationId: string
    clusterId: string
    toTimestamp?: string
  }) => ({
    queryKey: [organizationId, clusterId, toTimestamp],
    async queryFn() {
      const response = await auditLogsApi.getOrganizationEventTargets(
        organizationId,
        clusterId,
        toTimestamp,
        undefined,
        OrganizationEventTargetType.CLUSTER
      )
      return response.data
    },
  }),
})
