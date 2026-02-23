import { type ReactNode, memo } from 'react'
import { type AnyService } from '@qovery/domains/services/data-access'
import { MetricsWebSocketListener } from '@qovery/shared/util-web-sockets'
import { useService } from '../hooks/use-service/use-service'
import { ServiceOverview } from './service-overview'

const WebSocketListenerMemo = memo(MetricsWebSocketListener)

export interface ServiceOverviewFeatureProps {
  organizationId?: string
  projectId?: string
  environmentId?: string
  serviceId?: string
  /** Service data (from useService). When not provided, feature uses useService(environmentId, serviceId). */
  service?: AnyService
  /** Environment data (from useEnvironment). Required for WebSocket; pass from route to avoid circular dep. */
  environment?: { cluster_id: string }
  /** Whether cluster has no metrics (from cluster + service). Pass from route to avoid circular dep. */
  hasNoMetrics?: boolean
  /** Optional slot for Terraform "Infrastructure Resources" tab (injected by route to avoid circular dep). */
  terraformResourcesSection?: ReactNode
  /** Optional modal content for Observability callout (injected by route to avoid circular dep). */
  observabilityCalloutModalContent?: ReactNode
}

export function ServiceOverviewFeature({
  organizationId = '',
  projectId = '',
  environmentId = '',
  serviceId = '',
  service: serviceProp,
  environment,
  hasNoMetrics = false,
  terraformResourcesSection,
  observabilityCalloutModalContent,
}: ServiceOverviewFeatureProps) {
  const { data: serviceFromHook } = useService({ environmentId, serviceId })
  const service = serviceProp ?? serviceFromHook

  if (!service || !serviceId || !environmentId) {
    return null
  }

  return (
    <>
      <ServiceOverview
        serviceId={serviceId}
        environmentId={environmentId}
        service={service}
        hasNoMetrics={hasNoMetrics}
        terraformResourcesSection={terraformResourcesSection}
        observabilityCalloutModalContent={observabilityCalloutModalContent}
      />
      {environment && (
        <WebSocketListenerMemo
          organizationId={organizationId}
          clusterId={environment.cluster_id}
          projectId={projectId}
          environmentId={environmentId}
          serviceId={serviceId}
          serviceType={service.serviceType}
        />
      )}
    </>
  )
}
