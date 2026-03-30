import { useParams, useRouter, useSearch } from '@tanstack/react-router'
import {
  DatabaseModeEnum,
  type DeploymentHistoryEnvironmentV2,
  type Environment,
  type EnvironmentStatus,
  type Status,
} from 'qovery-typescript-axios'
import { type PropsWithChildren, useMemo } from 'react'
import { match } from 'ts-pattern'
import {
  ServiceActions,
  ServiceAvatar,
  ServiceLinksPopover,
  useLinks,
  useService,
} from '@qovery/domains/services/feature'
import { Button, DeploymentAction, Icon, StatusChip, Tooltip } from '@qovery/shared/ui'
import { dateUTCString } from '@qovery/shared/util-dates'
import { pluralize, trimId } from '@qovery/shared/util-js'
import { PodHealthChips } from '../pod-health-chips/pod-health-chips'

export interface HeaderLogsProps extends PropsWithChildren {
  type: 'DEPLOYMENT' | 'SERVICE'
  serviceId: string
  environment: Environment
  serviceStatus: Status
  environmentStatus?: EnvironmentStatus
  deploymentHistory?: DeploymentHistoryEnvironmentV2
}

export function HeaderLogs({
  type,
  environment,
  serviceId,
  environmentStatus,
  serviceStatus,
  children,
}: HeaderLogsProps) {
  const router = useRouter()
  const onBack = () => router.history.back()
  const { executionId } = useParams({ strict: false })
  const queryParams = useSearch({ strict: false })
  const { data: service } = useService({ environmentId: environment.id, serviceId, suspense: true })
  const { data: links = [] } = useLinks({ serviceId: serviceId, serviceType: service?.serviceType, suspense: true })
  const filteredLinks = links.filter((link) => !(link.is_default && link.is_qovery_domain))

  const isHistoricalServiceLogs = useMemo(
    () => !!queryParams.startDate || !!queryParams.endDate,
    [queryParams.startDate, queryParams.endDate]
  )

  const isManagedDatabase = useMemo(() => {
    return service?.serviceType === 'DATABASE' && service?.mode === DatabaseModeEnum.MANAGED
  }, [service])

  if (!service) return null

  const totalDurationSec = serviceStatus?.steps?.total_computing_duration_sec ?? 0

  const isNotDeployedOrStopped =
    serviceStatus?.status_details?.status === 'ERROR' ||
    serviceStatus?.status_details?.status === 'NEVER' ||
    serviceStatus?.state === 'STOPPED'

  return (
    <div
      className="flex h-12 w-full items-center justify-between border-b border-neutral bg-background"
      style={{
        paddingRight: 'var(--padding-sidebar, 16px)',
      }}
    >
      <div className="flex h-full">
        <div className="flex h-full items-center gap-3 py-2.5 pl-4 pr-0.5 text-sm font-medium text-neutral">
          {match(type)
            .with('DEPLOYMENT', () => {
              const subAction = serviceStatus.status_details?.sub_action
              const triggerAction = subAction !== 'NONE' ? subAction : serviceStatus.status_details?.action
              const actionStatus = serviceStatus.status_details?.status

              return (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Button onClick={onBack} variant="plain" iconOnly>
                      <Icon className="text-base" iconName="arrow-left" iconStyle="regular" />
                    </Button>
                    <div className="flex items-center justify-between gap-2">
                      <DeploymentAction
                        status={triggerAction}
                        iconClassName="hidden"
                        textClassName="text-base font-medium"
                      />
                      <StatusChip status={actionStatus} />
                    </div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="5" height="6" fill="none" viewBox="0 0 5 6">
                    <circle cx="2.5" cy="2.955" r="2.5" fill="var(--neutral-6)"></circle>
                  </svg>
                  <div className="flex gap-1.5">
                    <ServiceActions variant="deploy-dropdown-only" serviceId={serviceId} environment={environment} />
                    {!isNotDeployedOrStopped && !isManagedDatabase && filteredLinks.length > 0 && (
                      <ServiceLinksPopover
                        organizationId={environment.organization.id}
                        projectId={environment.project.id}
                        environmentId={environment.id}
                        serviceId={serviceId}
                        align="start"
                      >
                        <Button variant="outline" color="neutral" className="relative">
                          <div className="flex items-center gap-1">
                            <Icon iconName="link" iconStyle="regular" />
                            {pluralize(filteredLinks.length, 'Link', 'Links')}
                            <Icon iconName="angle-down" />
                          </div>
                        </Button>
                      </ServiceLinksPopover>
                    )}
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="5" height="6" fill="none" viewBox="0 0 5 6">
                    <circle cx="2.5" cy="2.955" r="2.5" fill="var(--neutral-6)"></circle>
                  </svg>
                  <span
                    className="flex items-center gap-1.5 truncate font-normal"
                    title={dateUTCString(serviceStatus.last_deployment_date ?? '')}
                  >
                    <Icon iconName="stopwatch" iconStyle="regular" className="text-base text-neutral-subtle" />
                    {Math.floor(totalDurationSec / 60)}m : {totalDurationSec % 60}s
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="5" height="6" fill="none" viewBox="0 0 5 6">
                    <circle cx="2.5" cy="2.955" r="2.5" fill="var(--neutral-6)"></circle>
                  </svg>
                  <Tooltip side="bottom" content={<span>Execution id: {executionId}</span>}>
                    <span className="flex items-center gap-1.5 truncate">
                      <Icon iconName="code" iconStyle="regular" className="text-sm text-neutral-subtle" />
                      <span className="font-normal text-neutral">{trimId(executionId ?? '')}</span>
                    </span>
                  </Tooltip>
                </div>
              )
            })
            .with('SERVICE', () => (
              <>
                <span className="flex items-center gap-2.5">
                  <ServiceAvatar size="xs" service={service} border="none" />
                  {service.name}
                </span>
                <Tooltip side="bottom" content={<span>Execution id: {environmentStatus?.last_deployment_id}</span>}>
                  <span>
                    <Icon className="text-base text-neutral-subtle" iconName="circle-info" iconStyle="regular" />
                  </span>
                </Tooltip>
                {!isNotDeployedOrStopped && !isManagedDatabase && filteredLinks.length > 0 && (
                  <>
                    {filteredLinks.length > 0 && (
                      <ServiceLinksPopover
                        organizationId={environment.organization.id}
                        projectId={environment.project.id}
                        environmentId={environment.id}
                        serviceId={serviceId}
                        align="start"
                      >
                        <Button variant="outline" color="neutral" className="relative">
                          <div className="flex items-center gap-1">
                            <Icon iconName="link" iconStyle="regular" />
                            {pluralize(filteredLinks.length, 'Link', 'Links')}
                            <Icon iconName="angle-down" />
                          </div>
                        </Button>
                      </ServiceLinksPopover>
                    )}
                    {!isHistoricalServiceLogs && (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="5" height="6" fill="none" viewBox="0 0 5 6">
                          <circle cx="2.5" cy="2.955" r="2.5" fill="var(--neutral-6)"></circle>
                        </svg>
                        <PodHealthChips service={service} />
                      </>
                    )}
                  </>
                )}
              </>
            ))
            .exhaustive()}
        </div>
      </div>
      {children}
    </div>
  )
}

export default HeaderLogs
