import { AlertTargetType } from 'qovery-typescript-axios'
import { useCluster } from '@qovery/domains/clusters/feature'
import { type AnyService, isBlueprintService, isTerraform } from '@qovery/domains/services/data-access'
import { getRdsBlueprintEngine, useBlueprint } from '@qovery/domains/services/feature'
import { useBlueprintDbInstance } from '../../database/database-rds-dashboard/util/use-blueprint-db-instance'
import { useEnvironment } from '../../hooks/use-environment/use-environment'

interface UseRdsAlertTargetProps {
  organizationId: string
  service?: AnyService
  enabled?: boolean
}

/** Resolve the CloudWatch instance and the alert target of an RDS blueprint service. */
export function useRdsAlertTarget({ organizationId, service, enabled = true }: UseRdsAlertTargetProps) {
  const isBlueprintCandidate = enabled && Boolean(service && isBlueprintService(service) && isTerraform(service))
  const blueprintId =
    isBlueprintCandidate && service && isBlueprintService(service) && isTerraform(service) ? service.blueprint_id : ''

  const {
    data: environment,
    isLoading: isEnvironmentLoading,
    isError: isEnvironmentError,
  } = useEnvironment({ environmentId: isBlueprintCandidate ? service?.environment?.id : undefined })
  const clusterId = environment?.cluster_id
  const {
    data: cluster,
    isLoading: isClusterLoading,
    isError: isClusterError,
  } = useCluster({
    organizationId,
    clusterId,
    enabled: Boolean(clusterId),
  })
  const isAws = cluster?.cloud_provider === 'AWS'

  const {
    data: blueprint,
    isLoading: isBlueprintLoading,
    isError: isBlueprintError,
  } = useBlueprint({
    blueprintId,
    enabled: Boolean(blueprintId) && isAws,
  })

  const isRds = isBlueprintCandidate && isAws && Boolean(getRdsBlueprintEngine(service, blueprint))
  const {
    dbInstance,
    isLoading: isVariablesLoading,
    isError: isVariablesError,
  } = useBlueprintDbInstance({
    serviceId: service?.id ?? '',
    enabled: isRds,
  })

  return {
    isRds,
    isResolving:
      isBlueprintCandidate &&
      (isEnvironmentLoading ||
        (Boolean(clusterId) && isClusterLoading) ||
        (Boolean(blueprintId) && isAws && isBlueprintLoading) ||
        (isRds && isVariablesLoading)),
    isMetadataUnavailable:
      isBlueprintCandidate &&
      (isEnvironmentError ||
        (!isEnvironmentLoading && !environment) ||
        isClusterError ||
        (Boolean(clusterId) && !isClusterLoading && !cluster) ||
        (isAws && (!blueprintId || isBlueprintError || (!isBlueprintLoading && !blueprint))) ||
        (isRds && isVariablesError)),
    dbInstance: isRds ? dbInstance : undefined,
    target: isRds && service ? { target_id: service.id, target_type: AlertTargetType.TERRAFORM } : undefined,
    hasCloudWatchMetrics:
      cluster?.metrics_parameters?.enabled === true &&
      cluster.metrics_parameters.configuration?.cloud_watch_export_config?.enabled === true,
  }
}
