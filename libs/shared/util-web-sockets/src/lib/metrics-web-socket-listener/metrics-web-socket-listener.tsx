import { type ServiceType } from '@qovery/domains/services/data-access'
import useMetricsWebSocket from '../use-metrics-web-socket/use-metrics-web-socket'

export interface MetricsWebSocketListenerProps {
  clusterId: string
  organizationId: string
  projectId: string
  environmentId: string
  serviceId: string
  serviceType: Omit<ServiceType, 'LIFECYCLE_JOB' | 'CRON_JOB'>
}

export function MetricsWebSocketListener({
  organizationId,
  clusterId,
  projectId,
  environmentId,
  serviceId,
  serviceType,
}: MetricsWebSocketListenerProps) {
  useMetricsWebSocket({
    organizationId,
    clusterId,
    projectId,
    environmentId,
    serviceId,
    serviceType,
  })
  return null
}

export default MetricsWebSocketListener
