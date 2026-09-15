export const QUERY_CPU = (containerName: string) => `
max by (pod, namespace, container) (rate(container_cpu_usage_seconds_total{container="${containerName}"}[1m])) / on(pod, namespace, container) kube_pod_container_resource_requests{resource="cpu", container="${containerName}"}`

export const QUERY_MEMORY = (containerName: string) => `
max by (pod, namespace, container) (container_memory_working_set_bytes{container="${containerName}"}) / on(pod, namespace, container) kube_pod_container_resource_requests{resource="memory", container="${containerName}"}
`
// Combined nginx + envoy HTTP error rate (uses nginx if available, otherwise envoy)
export const QUERY_HTTP_ERROR_COMBINED = (ingressName: string, httpRouteName: string) => `
(
  sum by (namespace) (
    rate(nginx_ingress_controller_requests{ingress="${ingressName}", status=~"5.."}[1m])
  )
  or
  sum by (namespace) (
    rate(envoy_cluster_upstream_rq_xx{envoy_cluster_name=~"httproute/.*", httproute_name="${httpRouteName}", envoy_response_code_class="5"}[1m])
  )
)
/
(
  sum by (namespace) (
    rate(nginx_ingress_controller_requests{ingress="${ingressName}"}[1m])
  )
  or
  sum by (namespace) (
    rate(envoy_cluster_upstream_rq_total{envoy_cluster_name=~"httproute/.*", httproute_name="${httpRouteName}"}[1m])
  )
)`

// Combined nginx + envoy HTTP latency p99 (uses nginx if available, otherwise envoy)
export const QUERY_HTTP_LATENCY_COMBINED = (ingressName: string, httpRouteName: string) => `
histogram_quantile(
  0.99,
  sum by (namespace, ingress, le) (
    rate(
      nginx_ingress_controller_request_duration_seconds_bucket{
        ingress="${ingressName}"
      }[1m]
    )
  )
)
or
(
  histogram_quantile(
    0.99,
    sum by (namespace, httproute_name, le) (
      rate(
        envoy_cluster_upstream_rq_time_bucket{
          envoy_cluster_name=~"httproute/.*",
          httproute_name="${httpRouteName}"
        }[1m]
      )
    )
  ) / 1000
)
`

export const QUERY_INSTANCE_RESTART = (containerName: string) => `
  (
    increase(
      kube_pod_container_status_restarts_total{
        container="${containerName}"
      }[5m]
    ) > 0
  )
  and on (namespace, pod, container)
  kube_pod_container_status_last_terminated_reason{
    container="${containerName}",
    reason=~"OOMKilled|Error|ContainerCannotRun|RunContainerError|StartError|DeadlineExceeded"
  }
`

export const QUERY_MISSING_INSTANCE = (containerName: string) => `
(
  kube_deployment_status_replicas_available{deployment="${containerName}"}
/
  kube_deployment_spec_replicas{deployment="${containerName}"}
)`

export const QUERY_HPA_ISSUE = (hpaName: string) => `
kube_horizontalpodautoscaler_status_condition{
  condition="ScalingLimited",
  status="true",
  horizontalpodautoscaler="${hpaName}"
}
and on(namespace, horizontalpodautoscaler)
(
  kube_horizontalpodautoscaler_status_current_replicas{
    horizontalpodautoscaler="${hpaName}"
  }
  ==
  kube_horizontalpodautoscaler_spec_max_replicas{
    horizontalpodautoscaler="${hpaName}"
  }
)`

const CERTIFICATE_OWNER_LABELS =
  'qovery_com_associated_service_id, qovery_com_associated_service_type, qovery_com_environment_id, qovery_com_project_id'

const CERTIFICATE_OWNER_BY_NAME = (serviceId: string) => `
max by (namespace, name, ${CERTIFICATE_OWNER_LABELS}) (
  kube_certmanager_certificate_labels{qovery_com_associated_service_id="${serviceId}"}
)`

const CERTIFICATE_OWNER_BY_DOMAIN = (serviceId: string) => `
max by (namespace, domain, ${CERTIFICATE_OWNER_LABELS}) (
  kube_certmanager_certificate_dns_names{qovery_com_associated_service_id="${serviceId}"}
)`

export const QUERY_CERTIFICATE_RENEWAL_FAILED = (serviceId: string) => `
(
  (
    (
      certmanager_certificate_renewal_timestamp_seconds{issuer_name="letsencrypt-qovery"} > 0
    )
    and on (namespace, name)
    (
      time() - certmanager_certificate_renewal_timestamp_seconds{issuer_name="letsencrypt-qovery"} > 3600
    )
    and on (namespace, name)
    (
      certmanager_certificate_expiration_timestamp_seconds{issuer_name="letsencrypt-qovery"} - time() > 0
    )
  )
  or on (namespace, name)
  (
    certmanager_certificate_ready_status{issuer_name="letsencrypt-qovery", condition="False"} == 1
  )
)
and on (namespace, name) group_left(${CERTIFICATE_OWNER_LABELS})
${CERTIFICATE_OWNER_BY_NAME(serviceId)}
or
(
  sum by (namespace, domain, reason) (
    certmanager_certificate_challenge_status{status=~"invalid|expired|errored"} == 1
  )
  and on (namespace, domain) group_left(${CERTIFICATE_OWNER_LABELS})
  ${CERTIFICATE_OWNER_BY_DOMAIN(serviceId)}
)`
