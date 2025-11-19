export const QUERY_CPU = (containerName: string) => `
rate(container_cpu_usage_seconds_total{container="${containerName}"}[5m]) / on(pod, namespace, container) kube_pod_container_resource_requests{resource="cpu", container="${containerName}"}`

export const QUERY_MEMORY = (containerName: string) => `
container_memory_working_set_bytes{container="${containerName}"} / kube_pod_container_resource_requests{resource="memory", container="${containerName}"}
`
