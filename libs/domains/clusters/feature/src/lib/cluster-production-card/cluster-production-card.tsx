import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { useNavigate } from '@tanstack/react-router'
import type { Cluster, ClusterStatus } from 'qovery-typescript-axios'
import { type KeyboardEvent, useMemo } from 'react'
import { Icon, StatusChip, Truncate } from '@qovery/shared/ui'
import { pluralize } from '@qovery/shared/util-js'
import { ClusterRunningStatusIndicator } from '../cluster-running-status-indicator/cluster-running-status-indicator'
import { useClusterDeploymentErrorServices } from '../hooks/use-cluster-deployment-error-services/use-cluster-deployment-error-services'
import { useClusterRunningErrorServices } from '../hooks/use-cluster-running-error-services/use-cluster-running-error-services'
import { useClusterRunningStatusSocket } from '../hooks/use-cluster-running-status-socket/use-cluster-running-status-socket'
import { ClusterServiceDeploymentStatusSockets } from '../hooks/use-cluster-service-deployment-status-socket/cluster-service-deployment-status-sockets'
import { ClusterServiceRunningStatusSockets } from '../hooks/use-cluster-service-running-status-socket/cluster-service-running-status-sockets'

export interface ClusterProductionCardProps {
  cluster: Cluster
  clusterStatus?: ClusterStatus
}

const MAX_DISPLAYED_ISSUES = 20

export function ClusterProductionCard({ cluster, clusterStatus }: ClusterProductionCardProps) {
  const navigate = useNavigate()

  useClusterRunningStatusSocket({ organizationId: cluster.organization.id, clusterId: cluster.id })

  const {
    serviceCount,
    allErrorServices: allRunningErrorServices,
    errorServiceCount: runningErrorServiceCount,
  } = useClusterRunningErrorServices({
    organizationId: cluster.organization.id,
    clusterId: cluster.id,
  })
  const { allErrorServices: allDeploymentErrorServices, errorServiceCount: deploymentErrorServiceCount } =
    useClusterDeploymentErrorServices({
      organizationId: cluster.organization.id,
      clusterId: cluster.id,
    })
  const totalErrorCount = runningErrorServiceCount + deploymentErrorServiceCount

  const { displayedErrorServices, hiddenErrorCount } = useMemo(() => {
    const errorServices = [
      ...allRunningErrorServices.map((service) => ({
        ...service,
        issueId: `${service.serviceId}-running`,
        issueLabel: 'Error',
        issueType: 'running' as const,
      })),
      ...allDeploymentErrorServices.map((service) => ({
        ...service,
        issueId: `${service.serviceId}-deployment`,
        issueLabel: service.stateLabel,
        issueType: 'deployment' as const,
      })),
    ].sort((left, right) => {
      const scopeComparison = `${left.projectName}/${left.environmentName}/${left.serviceName}`.localeCompare(
        `${right.projectName}/${right.environmentName}/${right.serviceName}`
      )

      return scopeComparison !== 0 ? scopeComparison : left.issueLabel.localeCompare(right.issueLabel)
    })

    return {
      displayedErrorServices: errorServices.slice(0, MAX_DISPLAYED_ISSUES),
      hiddenErrorCount: Math.max(errorServices.length - MAX_DISPLAYED_ISSUES, 0),
    }
  }, [allDeploymentErrorServices, allRunningErrorServices])

  const shouldShowSuccessState = serviceCount > 0 && totalErrorCount === 0 && clusterStatus?.status === 'DEPLOYED'

  const navigateToOverview = () =>
    navigate({
      to: '/organization/$organizationId/cluster/$clusterId/overview',
      params: { organizationId: cluster.organization.id, clusterId: cluster.id },
    })

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      navigateToOverview()
    }
  }

  const handleNavigateToService = ({
    environmentId,
    projectId,
    serviceId,
  }: {
    environmentId: string
    projectId: string
    serviceId: string
  }) =>
    navigate({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview',
      params: {
        organizationId: cluster.organization.id,
        projectId,
        environmentId,
        serviceId,
      },
    })

  return (
    <>
      <ClusterServiceRunningStatusSockets organizationId={cluster.organization.id} clusterId={cluster.id} />
      <ClusterServiceDeploymentStatusSockets organizationId={cluster.organization.id} clusterId={cluster.id} />

      <div
        role="link"
        tabIndex={0}
        onClick={navigateToOverview}
        onKeyDown={handleCardKeyDown}
        className="duration-50 hover:border-neutral-hover focus-visible:ring-brand-subtle flex cursor-pointer flex-col gap-5 rounded-lg border border-neutral bg-surface-neutral p-4 text-neutral shadow-sm transition-all hover:bg-surface-neutral-subtle focus-visible:outline-none focus-visible:ring-2"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-neutral bg-surface-neutral-subtle">
            <Icon name={cluster.cloud_provider} height="65%" width="65%" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-col gap-1">
              <p className="flex items-center gap-2 text-sm font-medium leading-tight">
                {cluster.name}
                <span className="mt-[1px]">
                  <ClusterRunningStatusIndicator
                    type="dot"
                    cluster={cluster}
                    clusterDeploymentStatus={clusterStatus?.status}
                  />
                </span>
              </p>

              <span className="text-ssm text-neutral-subtle">
                {serviceCount
                  ? `${serviceCount} ${pluralize(serviceCount, 'service', 'services')}`
                  : 'No services created yet'}
              </span>
            </div>

            {totalErrorCount > 0 && (
              <AccordionPrimitive.Root type="single" collapsible>
                <AccordionPrimitive.Item
                  value="errors"
                  className="overflow-hidden rounded-md border border-neutral bg-surface-neutral-subtle text-ssm text-negative"
                >
                  <AccordionPrimitive.Trigger
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                    className="group flex w-full items-center justify-between gap-3 px-3 py-3 text-left outline-none"
                  >
                    <p className="flex items-center gap-1.5 font-medium text-negative">
                      <Icon iconName="circle-exclamation" iconStyle="solid" />
                      {totalErrorCount} {pluralize(totalErrorCount, 'issue', 'issues')} ongoing on your services
                    </p>
                    <Icon
                      iconName="chevron-down"
                      className="text-neutral-subtle transition-transform duration-200 group-data-[state=open]:rotate-180"
                    />
                  </AccordionPrimitive.Trigger>

                  <AccordionPrimitive.Content className="data-[state=closed]:slidein-up-sm-faded overflow-hidden data-[state=open]:animate-slidein-down-sm-faded">
                    <div className="flex flex-col px-3 pb-2">
                      {displayedErrorServices.map(
                        ({
                          environmentId,
                          environmentName,
                          issueId,
                          issueLabel,
                          issueType,
                          projectId,
                          projectName,
                          serviceId,
                          serviceName,
                        }) => (
                          <button
                            key={issueId}
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              handleNavigateToService({ environmentId, projectId, serviceId })
                            }}
                            onKeyDown={(event) => event.stopPropagation()}
                            className="flex items-center justify-between gap-2 truncate rounded-md border border-transparent p-3 text-left text-ssm font-medium text-neutral hover:border-neutral hover:bg-surface-neutral-component"
                          >
                            <div className="flex items-center gap-2">
                              <Truncate text={projectName} truncateLimit={30} />{' '}
                              <span className="text-surface-neutral-solid">/</span>
                              <Truncate text={environmentName} truncateLimit={30} />
                              <span className="text-surface-neutral-solid">/</span>
                              <Truncate text={serviceName} truncateLimit={30} />
                            </div>
                            <span className="flex items-center gap-1.5 text-negative">
                              {issueType === 'running' ? (
                                <StatusChip status="ERROR" />
                              ) : (
                                <Icon iconName="rocket" iconStyle="regular" />
                              )}
                              {issueLabel}
                            </span>
                          </button>
                        )
                      )}

                      {hiddenErrorCount > 0 && (
                        <p className="text-ssm text-neutral-subtle">
                          +{hiddenErrorCount} more {pluralize(hiddenErrorCount, 'issue', 'issues')}
                        </p>
                      )}
                    </div>
                  </AccordionPrimitive.Content>
                </AccordionPrimitive.Item>
              </AccordionPrimitive.Root>
            )}

            {shouldShowSuccessState && (
              <div className="rounded-md border border-positive-subtle bg-surface-positive-subtle px-3 py-3 text-ssm">
                <p className="flex items-center gap-1.5 font-medium text-positive">
                  <Icon iconName="circle-check" iconStyle="regular" />
                  All services running and up to date
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
