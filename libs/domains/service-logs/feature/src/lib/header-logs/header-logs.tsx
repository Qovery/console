import {
  type DeploymentHistoryEnvironmentV2,
  type Environment,
  type EnvironmentStatus,
  type Status,
} from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import {
  ServiceActionToolbar,
  ServiceAvatar,
  ServiceLinksPopover,
  useLinks,
  useService,
} from '@qovery/domains/services/feature'
import { ActionTriggerStatusChip, Button, Icon, Tooltip } from '@qovery/shared/ui'
import { dateUTCString } from '@qovery/shared/util-dates'
import { pluralize } from '@qovery/shared/util-js'

export interface HeaderLogsProps extends PropsWithChildren {
  type: 'DEPLOYMENT' | 'SERVICE'
  serviceId: string
  environment: Environment
  serviceStatus: Status
  environmentStatus?: EnvironmentStatus
  deploymentHistory?: DeploymentHistoryEnvironmentV2
}

function EndCurve() {
  return (
    <svg
      className="relative -left-0.5 -top-[1px]"
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="48"
      fill="none"
      viewBox="0 0 40 49"
    >
      <path fill="#1A2031" d="M0 .955h5.071a16 16 0 0114.545 9.334l17.722 38.666H0v-48z"></path>
      <path stroke="#2A3041" d="M37.084 48.955L18.037 7.764A11 11 0 008.052 1.38H0"></path>
    </svg>
  )
}

export function HeaderLogs({
  type,
  environment,
  serviceId,
  environmentStatus,
  serviceStatus,
  deploymentHistory,
  children,
}: HeaderLogsProps) {
  const { data: service } = useService({ environmentId: environment.id, serviceId })
  const { data: links = [] } = useLinks({ serviceId: serviceId, serviceType: service?.serviceType })
  const filteredLinks = links.filter((link) => !(link.is_default && link.is_qovery_domain))

  if (!service) return null

  const totalDurationSec = serviceStatus?.steps?.total_computing_duration_sec ?? 0

  return (
    <div
      className="flex h-12 w-full items-center justify-between border-b border-neutral-500 bg-neutral-900"
      style={{
        paddingRight: 'var(--padding-sidebar, 16px)',
      }}
    >
      <div className="flex h-full">
        <div className="flex h-full items-center gap-4 border-t border-neutral-500 bg-neutral-600 py-2.5 pl-4 pr-0.5 text-sm font-medium text-neutral-50">
          <span className="flex items-center gap-2">
            <span className="flex items-center gap-2.5">
              <ServiceAvatar size="xs" service={service} border="none" />
              {service.name}
            </span>
            <Tooltip side="bottom" content={<span>Execution id: {environmentStatus?.last_deployment_id}</span>}>
              <span>
                <Icon className="text-base" iconName="circle-info" iconStyle="regular" />
              </span>
            </Tooltip>
          </span>
          {type === 'DEPLOYMENT' && (
            <>
              <ServiceActionToolbar variant="deployment" serviceId={serviceId} environment={environment} />
              {deploymentHistory?.trigger_action && (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="5" height="6" fill="none" viewBox="0 0 5 6">
                    <circle cx="2.5" cy="2.955" r="2.5" fill="#383E50"></circle>
                  </svg>
                  <ActionTriggerStatusChip
                    status={serviceStatus?.state}
                    triggerAction={deploymentHistory.trigger_action}
                  />
                </>
              )}
              <svg xmlns="http://www.w3.org/2000/svg" width="5" height="6" fill="none" viewBox="0 0 5 6">
                <circle cx="2.5" cy="2.955" r="2.5" fill="#383E50"></circle>
              </svg>
              <span
                className="flex items-center gap-1.5 truncate"
                title={dateUTCString(serviceStatus.last_deployment_date ?? '')}
              >
                <Icon iconName="stopwatch" iconStyle="regular" className="text-base text-neutral-250" />
                {Math.floor(totalDurationSec / 60)}m : {totalDurationSec % 60}s
              </span>
            </>
          )}
          <ServiceLinksPopover
            organizationId={environment.organization.id}
            projectId={environment.project.id}
            environmentId={environment.id}
            serviceId={serviceId}
            align="start"
          >
            <Button variant="surface" color="neutral" radius="full">
              <Tooltip content="Links">
                <div className="flex items-center gap-1">
                  <Icon iconName="link" iconStyle="regular" />
                  {filteredLinks.length} {pluralize(filteredLinks.length, 'link', 'links')}
                  <Icon iconName="angle-down" />
                </div>
              </Tooltip>
            </Button>
          </ServiceLinksPopover>
        </div>
        <EndCurve />
      </div>
      {children}
    </div>
  )
}

export default HeaderLogs
