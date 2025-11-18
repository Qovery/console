export const QUERY_CPU = (containerName: string, threshold: number) => `
(rate(container_cpu_usage_seconds_total{container="${containerName}"}[5m]) / (kube_pod_container_resource_requests{resource="cpu", container="${containerName}"} / 1000)) > ${threshold}
`
export const QUERY_MEMORY = (containerName: string, threshold: number) => `
(container_memory_working_set_bytes{container="${containerName}"} / kube_pod_container_resource_requests{resource="memory", container="${containerName}"}) > ${threshold}
`
