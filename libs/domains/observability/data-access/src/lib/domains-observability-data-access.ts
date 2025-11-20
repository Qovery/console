import { createQueryKeys } from '@lukemorales/query-key-factory'
import {
  type AlertReceiverCreationRequest,
  type AlertReceiverEditRequest,
  AlertReceiversApi,
  type AlertRuleCreationRequest,
  type AlertRuleEditRequest,
  AlertRulesApi,
  ClustersApi,
} from 'qovery-typescript-axios'

const clusterApi = new ClustersApi()
const alertRulesApi = new AlertRulesApi()
const alertReceiversApi = new AlertReceiversApi()

export const observability = createQueryKeys('observability', {
  containerName: ({
    clusterId,
    serviceId,
    resourceType = 'deployment',
    startDate,
    endDate,
  }: {
    clusterId: string
    serviceId: string
    resourceType?: 'deployment' | 'statefulset'
    startDate: string
    endDate: string
  }) => ({
    queryKey: ['containerName', clusterId, serviceId, resourceType],
    async queryFn() {
      const endpoints = {
        deployment: `api/v1/label/deployment/values?match[]=kube_deployment_labels{label_qovery_com_service_id="${serviceId}"}`,
        statefulset: `api/v1/label/statefulset/values?match[]=kube_statefulset_labels{label_qovery_com_service_id="${serviceId}"}`,
      }

      const endpoint = endpoints[resourceType]
      const response = await clusterApi.getClusterMetrics(
        clusterId,
        endpoint,
        '',
        startDate,
        endDate,
        undefined,
        undefined,
        undefined,
        'True',
        'True',
        undefined,
        'prometheus',
        'false',
        'service_overview',
        'container_name'
      )
      return response.data.metrics && (JSON.parse(response.data.metrics).data[0] as string)
    },
  }),
  ingressName: ({
    clusterId,
    serviceId,
    startDate,
    endDate,
  }: {
    clusterId: string
    serviceId: string
    startDate: string
    endDate: string
  }) => ({
    queryKey: ['ingressName', clusterId, serviceId],
    async queryFn() {
      const endpoint = `api/v1/label/ingress/values?match[]=kube_ingress_labels{label_qovery_com_associated_service_id="${serviceId}"}`
      const response = await clusterApi.getClusterMetrics(
        clusterId,
        endpoint,
        '',
        startDate,
        endDate,
        undefined,
        undefined,
        undefined,
        'True',
        'True',
        undefined,
        'prometheus',
        'false',
        'service_overview',
        'ingressName'
      )
      return response.data.metrics && (JSON.parse(response.data.metrics).data[0] as string)
    },
  }),
  namespace: ({
    clusterId,
    serviceId,
    resourceType = 'deployment',
    startDate,
    endDate,
  }: {
    clusterId: string
    serviceId: string
    resourceType?: 'deployment' | 'statefulset'
    startDate: string
    endDate: string
  }) => ({
    queryKey: ['namespace', clusterId, serviceId, resourceType],
    async queryFn() {
      const endpoints = {
        deployment: `api/v1/label/namespace/values?match[]=kube_deployment_labels{label_qovery_com_service_id="${serviceId}"}`,
        statefulset: `api/v1/label/namespace/values?match[]=kube_statefulset_labels{label_qovery_com_service_id="${serviceId}"}`,
      }
      const endpoint = endpoints[resourceType]
      const response = await clusterApi.getClusterMetrics(
        clusterId,
        endpoint,
        '',
        startDate,
        endDate,
        undefined,
        undefined,
        undefined,
        'True',
        'True',
        undefined,
        'prometheus',
        'false',
        'service_overview',
        'namespace'
      )
      return response.data.metrics && (JSON.parse(response.data.metrics).data[0] as string)
    },
  }),
  metrics: ({
    clusterId,
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
    queryKey: [query, timeRange, startTimestamp, endTimestamp, step],
    async queryFn() {
      const response = await clusterApi.getClusterMetrics(
        clusterId,
        `api/v1/${queryRange}`,
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
  lokiMetrics: ({ clusterId, query, endTimestamp }: { clusterId: string; query: string; endTimestamp: string }) => ({
    queryKey: [clusterId, query, endTimestamp],
    async queryFn() {
      const response = await clusterApi.getClusterLogs(
        clusterId,
        '/loki/api/v1/query',
        query,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        endTimestamp
      )
      return typeof response.data.response === 'string' ? JSON.parse(response.data.response) : response.data.response
    },
  }),
  alertRules: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn() {
      const response = await alertRulesApi.getAlertRules(organizationId)
      return response.data.results
    },
  }),
  alertReceivers: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn() {
      const response = await alertReceiversApi.getAlertReceivers(organizationId)
      return response.data.results
    },
  }),
})

export const mutations = {
  async createAlertRule({ payload }: { payload: AlertRuleCreationRequest }) {
    const response = await alertRulesApi.createAlertRule(payload)
    return response.data
  },
  async editAlertRule({ alertRuleId, payload }: { alertRuleId: string; payload: AlertRuleEditRequest }) {
    const response = await alertRulesApi.editAlertRule(alertRuleId, payload)
    return response.data
  },
  async deleteAlertRule({ alertRuleId }: { alertRuleId: string }) {
    const response = await alertRulesApi.deleteAlertRule(alertRuleId)
    return response.data
  },
  async createAlertReceiver({ payload }: { payload: AlertReceiverCreationRequest }) {
    const response = await alertReceiversApi.createAlertReceiver(payload)
    return response.data
  },
  async editAlertReceiver({
    alertReceiverId,
    payload,
  }: {
    alertReceiverId: string
    payload: AlertReceiverEditRequest
  }) {
    const response = await alertReceiversApi.editAlertReceiver(alertReceiverId, payload)
    return response.data
  },
  async deleteAlertReceiver({ alertReceiverId }: { alertReceiverId: string }) {
    const response = await alertReceiversApi.deleteAlertReceiver(alertReceiverId)
    return response.data
  },
}
