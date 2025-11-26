export const QUERY_CPU = (containerName: string) => `
rate(container_cpu_usage_seconds_total{container="${containerName}"}[5m]) / on(pod, namespace, container) kube_pod_container_resource_requests{resource="cpu", container="${containerName}"}`

export const QUERY_MEMORY = (containerName: string) => `
container_memory_working_set_bytes{container="${containerName}"} / kube_pod_container_resource_requests{resource="memory", container="${containerName}"}
`

export const QUERY_REPLICAS_NUMBER = (containerName: string) => `
kube_deployment_status_replicas_available{deployment="${containerName}"} - kube_deployment_spec_replicas{deployment="${containerName}"}`

export const QUERY_HPA_ISSUE = (serviceId: string) => `
sum by (label_qovery_com_service_id) (
(
    kube_horizontalpodautoscaler_status_condition{
  condition="ScalingLimited",
    status="true"
}
* on (namespace, horizontalpodautoscaler) group_left(label_qovery_com_service_id)
kube_horizontalpodautoscaler_labels{
  label_qovery_com_service_id="${serviceId}"
}
)
and on (namespace, horizontalpodautoscaler)
(
  kube_horizontalpodautoscaler_status_current_replicas
  == kube_horizontalpodautoscaler_spec_max_replicas
)
)`

export const QUERY_K8S_EVENT = (serviceId: string) => `
rate(k8s_event_logger_q_k8s_events_total{
      qovery_com_service_id="${serviceId}",
      reason=~"Failed|OOMKilled|BackOff|Evicted|FailedScheduling|FailedMount|FailedAttachVolume|Preempted|NodeNotReady",
      type="Warning"
    }[1m])`

export const QOVERY_HTTP_ERROR = (ingressName: string) => `
  sum by(namespace, ingress) (nginx:req_inc:5m_by_status{ingress="${ingressName}", status=~"5.."})
  /
  sum by(namespace, ingress) (nginx:req_inc:5m{ingress="${ingressName}"})`
