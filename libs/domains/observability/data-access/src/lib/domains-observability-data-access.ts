import { createQueryKeys } from '@lukemorales/query-key-factory'
import { AlertRulesApi, ClustersApi } from 'qovery-typescript-axios'

const clusterApi = new ClustersApi()
const alertRulesApi = new AlertRulesApi()

export const observability = createQueryKeys('observability', {
  containerName: ({
    clusterId,
    serviceId,
    resourceType = 'deployment',
  }: {
    clusterId: string
    serviceId: string
    resourceType?: 'deployment' | 'statefulset'
  }) => ({
    queryKey: ['containerName', clusterId, serviceId, resourceType],
    async queryFn() {
      const endpoints = {
        deployment: `api/v1/label/deployment/values?match[]=kube_deployment_labels{label_qovery_com_service_id="${serviceId}"}`,
        statefulset: `api/v1/label/statefulset/values?match[]=kube_statefulset_labels{label_qovery_com_service_id="${serviceId}"}`,
      }

      const endpoint = endpoints[resourceType]
      const response = await clusterApi.getClusterMetrics(clusterId, endpoint, '')
      return response.data.metrics && (JSON.parse(response.data.metrics).data[0] as string)
    },
  }),
  ingressName: ({ clusterId, serviceId }: { clusterId: string; serviceId: string }) => ({
    queryKey: ['ingressName', clusterId, serviceId],
    async queryFn() {
      const endpoint = `api/v1/label/ingress/values?match[]=kube_ingress_labels{label_qovery_com_associated_service_id="${serviceId}"}`
      const response = await clusterApi.getClusterMetrics(clusterId, endpoint, '')
      return response.data.metrics && (JSON.parse(response.data.metrics).data[0] as string)
    },
  }),
  namespace: ({
    clusterId,
    serviceId,
    resourceType = 'deployment',
  }: {
    clusterId: string
    serviceId: string
    resourceType?: 'deployment' | 'statefulset'
  }) => ({
    queryKey: ['namespace', clusterId, serviceId, resourceType],
    async queryFn() {
      const endpoints = {
        deployment: `api/v1/label/namespace/values?match[]=kube_deployment_labels{label_qovery_com_service_id="${serviceId}"}`,
        statefulset: `api/v1/label/namespace/values?match[]=kube_statefulset_labels{label_qovery_com_service_id="${serviceId}"}`,
      }
      const endpoint = endpoints[resourceType]
      const response = await clusterApi.getClusterMetrics(clusterId, endpoint, '')
      return response.data.metrics && (JSON.parse(response.data.metrics).data[0] as string)
    },
  }),
  metrics: ({
    clusterId,
    endpoint = 'prometheus',
    query,
    queryRange,
    startTimestamp,
    endTimestamp,
    time,
    step,
    timeRange,
    maxSourceResolution,
    // These params are used to generate charts in Grafana
    boardShortName,
    metricShortName,
    traceId,
    alignedRange,
  }: {
    clusterId: string
    endpoint?: 'loki' | 'prometheus'
    query: string
    maxSourceResolution: string
    boardShortName: string
    metricShortName: string
    traceId: string
    alignedRange: string
    step?: string
    startTimestamp?: string
    endTimestamp?: string
    time?: string
    queryRange?: 'query' | 'query_range'
    timeRange?: string
  }) => ({
    queryKey: [endpoint, query, timeRange, startTimestamp, endTimestamp, step],
    async queryFn() {
      const url = endpoint === 'loki' ? `/loki/api/v1/${queryRange}` : `api/v1/${queryRange}`
      const response = await clusterApi.getClusterMetrics(
        clusterId,
        url,
        query,
        startTimestamp,
        endTimestamp,
        step,
        time,
        undefined,
        'True',
        'True',
        maxSourceResolution,
        'thanos',
        'false',
        boardShortName,
        metricShortName,
        traceId,
        alignedRange
      )

      return response.data.metrics && JSON.parse(response.data.metrics)
    },
  }),
  alertRules: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn() {
      const response = await alertRulesApi.getAlertRules(organizationId)
      return response.data.results
    },
  }),
})
