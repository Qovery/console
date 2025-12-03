export const QUERY_CPU = (containerName: string) => `
rate(container_cpu_usage_seconds_total{container="${containerName}"}[1m]) / on(pod, namespace, container) kube_pod_container_resource_requests{resource="cpu", container="${containerName}"}`

export const QUERY_MEMORY = (containerName: string) => `
container_memory_working_set_bytes{container="${containerName}"} / on(pod, namespace, container) kube_pod_container_resource_requests{resource="memory", container="${containerName}"}
`

export const QUERY_HTTP_ERROR = (ingressName: string) => `
 (
  sum by (ingress, namespace) (
    rate(nginx_ingress_controller_requests{ingress="${ingressName}",
      status=~"5.."
    }[1m])
  )
)
/
(
  sum by (ingress, namespace) (
    rate(nginx_ingress_controller_requests{
      ingress="${ingressName}"
    }[1m])
  )
)`

export const QUERY_HTTP_LATENCY = (ingressName: string) => `
 histogram_quantile(
    0.99,
    sum by (namespace, ingress, le) (
      rate(
        nginx_ingress_controller_request_duration_seconds_bucket{
          ingress="${ingressName}",
        }[1m]
      )
    )
  )`

export const QUERY_INSTANCE_RESTART = (containerName: string) => `
  (
    increase(
      kube_pod_container_status_restarts_total{
        container="${containerName}"
      }[1m]
    ) > 0
  )
  and on (namespace, pod, container)
  kube_pod_container_status_last_terminated_reason{
    container="${containerName}",
    reason=~"OOMKilled|Error|ContainerCannotRun|RunContainerError|StartError|DeadlineExceeded"
  }
`

export const QUERY_MISSING_REPLICAS = (containerName: string) => `
(
  kube_deployment_status_replicas_available{deployment="${containerName}"}
/
  kube_deployment_spec_replicas{deployment="${containerName}"}
)`

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
