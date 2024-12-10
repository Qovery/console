import clsx from 'clsx'
import { Link, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import {
  DEPLOYMENT_LOGS_VERSION_URL,
  ENVIRONMENT_LOGS_URL,
  ENVIRONMENT_PRE_CHECK_LOGS_URL,
  ENVIRONMENT_STAGES_URL,
} from '@qovery/shared/routes'
import { Button, DropdownMenu, Icon, StatusChip, Tooltip } from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/util-dates'
import { trimId } from '@qovery/shared/util-js'
import { useDeploymentHistory } from '../hooks/use-deployment-history/use-deployment-history'

export interface BreadcrumbDeploymentHistoryProps {
  type: 'DEPLOYMENT' | 'STAGES' | 'PRE_CHECK'
  serviceId?: string
  versionId?: string
}

export function BreadcrumbDeploymentHistory({ type, serviceId, versionId }: BreadcrumbDeploymentHistoryProps) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const { data: deploymentHistory = [], isFetched: isFetchedDeloymentHistory } = useDeploymentHistory({ environmentId })

  if (!isFetchedDeloymentHistory || deploymentHistory.length === 0) return null

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col">
        <span className="mb-1 ml-2 text-xs font-medium text-neutral-350 dark:text-neutral-300">Deployment History</span>
        <div className="flex items-center">
          <DropdownMenu.Root>
            <span className="relative -top-[2px] flex h-6 items-center px-2">
              {!versionId || versionId === deploymentHistory[0]?.identifier.execution_id ? (
                <Tooltip content={dateFullFormat(deploymentHistory[0].auditing_data.created_at)} side="bottom">
                  <span className="mr-2 flex h-5 items-center gap-1 rounded bg-purple-500 px-1 text-sm font-medium text-neutral-50">
                    Latest
                    <Icon iconName="circle-info" iconStyle="regular" className="text-xs" />
                  </span>
                </Tooltip>
              ) : (
                <span className="mr-2 text-sm font-medium text-neutral-50">
                  {dateFullFormat(
                    deploymentHistory.find((h) => h.identifier.execution_id === versionId)?.auditing_data.created_at ??
                      0
                  )}
                </span>
              )}
              <DropdownMenu.Trigger asChild>
                <Button type="button" variant="plain" radius="full">
                  <Icon iconName="angle-down" />
                </Button>
              </DropdownMenu.Trigger>
            </span>
            <DropdownMenu.Content className="-ml-2.5 max-h-64 w-80 overflow-y-auto">
              <span className="mb-1 block px-2 text-sm font-medium text-neutral-250">Deployment History</span>
              {deploymentHistory.map((history) => (
                <DropdownMenu.Item
                  asChild
                  key={history.identifier.execution_id}
                  className={clsx('min-h-9', {
                    'bg-neutral-400':
                      (versionId || deploymentHistory[0]?.identifier.execution_id) === history.identifier.execution_id,
                  })}
                >
                  <Link
                    className="flex w-full justify-between"
                    to={match(type)
                      .with(
                        'DEPLOYMENT',
                        () =>
                          ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) +
                          DEPLOYMENT_LOGS_VERSION_URL(serviceId, history.identifier.execution_id)
                      )
                      .with(
                        'STAGES',
                        () =>
                          ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) +
                          ENVIRONMENT_STAGES_URL(history.identifier.execution_id)
                      )
                      .with(
                        'PRE_CHECK',
                        () =>
                          ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) +
                          ENVIRONMENT_PRE_CHECK_LOGS_URL(history.identifier.execution_id)
                      )
                      .exhaustive()}
                  >
                    <Tooltip content={history.identifier.execution_id}>
                      <span>{trimId(history.identifier.execution_id)}</span>
                    </Tooltip>
                    <span className="flex items-center gap-2.5 text-xs text-neutral-250">
                      {dateFullFormat(history.auditing_data.created_at)}
                      <StatusChip status={history.status} />
                    </span>
                  </Link>
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </div>
    </div>
  )
}

export default BreadcrumbDeploymentHistory
